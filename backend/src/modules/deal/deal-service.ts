import {
  mapRawDeal,
  type CreateDealContractArgs,
  type CreateDealRequest,
  type DealResponse,
  type RawDeal,
  type TransactionResponse,
  type UploadBriefResponse,
  type MintIDRXRequest,
  type CreateDealReviewRequest,
  type UploadBriefRequest,
} from "./deal-types";
import { AuditService, type AuditChange } from "@/modules/audit/audit-service";
import {
  env,
  service,
  contractModel,
  convertBigInts,
  prismaClient,
  renderTemplate,
  cancelJob,
  convertRupiahToWad,
  convertWadToRupiah,
  scheduleJob,
  sendMail,
  waitForTransactionReceipt,
  MinioService,
  HOUR,
} from "@/common";

import { AuditAction, type PrismaClient } from "../../../generated/prisma";

import { HTTPException } from "hono/http-exception";
import cuid from "cuid";

export class DealService {
  private prisma: PrismaClient;
  private minio: MinioService;
  private audit: AuditService;

  constructor(prisma: PrismaClient, minio: MinioService, audit: AuditService) {
    this.prisma = prisma;
    this.minio = minio;
    this.audit = audit;
  }

  // Create New Deal
  @service
  async createNewDeal(
    userAddress: string,
    request: CreateDealRequest
  ): Promise<TransactionResponse> {
    // Get wallet address from email
    const creatorAddress = await this.getWalletAddressByEmail(request.email);

    // Generate server-side CUID
    const dealId = cuid();

    const dealAmount = convertRupiahToWad(request.amount);
    const dealArgs: CreateDealContractArgs = {
      dealId: dealId,
      brand: userAddress, // authenticated user
      creator: creatorAddress, // from email
      amount: dealAmount,
      deadline: request.deadline,
      briefHash: request.brief_hash,
    };

    console.log("Creating deal arguments :\n", dealArgs);

    const transactionHash = await contractModel.createDeal(dealArgs);

    // Log audit
    const delta: AuditChange = {
      after: {
        deal_id: dealId,
        brand: userAddress,
        creator: creatorAddress,
        amount: request.amount,
        deadline: request.deadline,
        brief_hash: request.brief_hash,
        transaction_hash: transactionHash,
      },
    };
    await this.audit.logAction(AuditAction.CREATE, "deal", dealId, delta);

    // Schedule auto-refund after deal deadline
    scheduleJob(`auto-refund-${dealId}`, request.deadline, async () => {
      await this.autoRefundAfterDeadline(dealId);
    });

    return {
      deal_id: dealId,
      transaction_hash: transactionHash,
    };
  }

  // Submit Deal Content
  @service
  async submitDealContent(
    dealId: string,
    contentUrl: string,
    creatorAddress: string,
    creatorName: string,
    creatorEmail: string
  ) {
    // Trigger blockchain content submission
    await contractModel.submitContent(dealId, creatorAddress, contentUrl);

    // Cancel auto-refund job
    cancelJob(`auto-refund-${dealId}`);

    // Schedule auto-release in 72 hours
    const delayMs = 72 * HOUR;
    scheduleJob(`auto-release-${dealId}`, delayMs, async () => {
      await this.handleAutoReleaseIfStillPending(
        dealId,
        creatorName,
        creatorEmail
      );
    });

    console.log(`Scheduled auto-release for deal ${dealId} in 72 hours.`);

    // Log audit
    const delta: AuditChange = {
      after: { content_url: contentUrl, status: "PENDING_REVIEW" },
    };
    await this.audit.logAction(AuditAction.SUBMIT, "deal", dealId, delta);

    return {
      deal_id: dealId,
      content_url: contentUrl,
      status: "PENDING_REVIEW",
    };
  }

  // Accept Existing Deal
  @service
  async acceptExistingDeal(dealId: string, creatorAddress: string) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.acceptDeal,
      creatorAddress
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "PENDING" },
      after: tx,
    };
    await this.audit.logAction(AuditAction.ACCEPT, "deal", dealId, delta);

    return tx;
  }

  // Approve Existing Deal
  @service
  async approveExistingDeal(dealId: string, brandAddress: string) {
    // Cancel auto-refund
    cancelJob(`auto-refund-${dealId}`);

    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.approveDeal,
      brandAddress
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "PENDING_REVIEW" },
      after: tx,
    };
    await this.audit.logAction(AuditAction.APPROVE, "deal", dealId, delta);

    return tx;
  }

  // Fund Existing Deal
  @service
  async fundExistingDeal(
    dealId: string,
    userId: string,
    brandAddress: string,
    amount: number
  ) {
    const approval = await contractModel.approveIDRX(userId, amount);

    console.log("Funding deal with permit...");
    const response = await contractModel.fundDeal(
      dealId,
      brandAddress,
      approval.dealAmount,
      approval.deadline,
      approval.v,
      approval.r,
      approval.s
    );

    await waitForTransactionReceipt(response);

    // Log audit
    const delta: AuditChange = {
      before: { status: "PENDING" },
      after: { status: "ACTIVE", amount, transaction_hash: response },
    };
    await this.audit.logAction(AuditAction.FUND, "deal", dealId, delta);

    return response;
  }

  // Initiate Dispute
  @service
  async initiateDispute(dealId: string, brandAddress: string, reason: string) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.initiateDispute,
      brandAddress,
      reason
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "PENDING_REVIEW" },
      after: {
        reason,
        ...tx,
      },
    };
    await this.audit.logAction(AuditAction.DISPUTE, "deal", dealId, delta);

    return tx;
  }

  // Resolve Dispute
  @service
  async resolveDispute(
    dealId: string,
    creatorAddress: string,
    isAcceptDispute: boolean
  ) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.resolveDispute,
      creatorAddress,
      isAcceptDispute
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "DISPUTED" },
      after: {
        accepted: isAcceptDispute,
        ...tx,
      },
    };
    await this.audit.logAction(AuditAction.RESOLVE, "deal", dealId, delta);

    return tx;
  }

  // Get Deal by ID
  @service
  async getDealById(dealId: string): Promise<DealResponse> {
    const tx = await contractModel.getDeal(dealId);

    if (!tx) throw new HTTPException(404, { message: "Deal not found" });

    const deal = this.createDealToResponse(convertBigInts(tx));

    return deal;
  }

  // Cancel Deal
  @service
  async cancelDeal(dealId: string, brandAddress: string) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.cancelDeal,
      brandAddress
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "PENDING" },
      after: tx,
    };
    await this.audit.logAction(AuditAction.CANCEL, "deal", dealId, delta);

    return tx;
  }

  // Emergency cancel
  @service
  async emergencyCancelDeal(dealId: string) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.emergencyCancelDeal
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "ACTIVE|PENDING_REVIEW" },
      after: { ...tx },
    };
    await this.audit.logAction(
      AuditAction.EMERGENCY_CANCEL,
      "deal",
      dealId,
      delta
    );

    return tx;
  }

  // Get Deals
  @service
  async getDeals(
    userAddress: string,
    isBrand: boolean
  ): Promise<DealResponse[]> {
    const dealIds = await this.getDealsIds(userAddress, isBrand);

    // Fetch all deals in one go if possible
    const deals = await Promise.all(
      dealIds.map((dealId: string) => this.getDealById(dealId))
    );

    return deals;
  }

  // Can auto release
  @service
  async canAutoRelease(dealId: string): Promise<boolean> {
    return contractModel.canAutoRelease(dealId);
  }

  // Create Review
  @service
  async createDealReview(userId: string, data: CreateDealReviewRequest) {
    // Determine the reviewee based on the deal reviewer
    const revieweeId = await this.findOppositeParty(userId, data.id);

    // Check if already reviewed
    const existing = await this.prisma.review.findUnique({
      where: {
        one_review_per_user_pair_per_deal: {
          deal_id: data.id,
          reviewer_id: userId,
          reviewee_id: revieweeId,
        },
      },
    });

    if (existing) {
      throw new HTTPException(409, {
        message: "You have already reviewed this deal",
      });
    }

    const review = await this.prisma.review.create({
      data: {
        deal_id: data.id,
        reviewer_id: userId,
        reviewee_id: revieweeId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return review;
  }

  // Get Review
  @service
  async getDealReviewById(dealId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { deal_id: dealId },
      include: {
        reviewee: {
          select: { id: true, name: true, role: true },
        },
        reviewer: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return reviews;
  }

  @service
  async getUserReviews(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        OR: [{ reviewer_id: userId }, { reviewee_id: userId }],
      },
      include: {
        reviewer: { select: { id: true, name: true, role: true } },
        reviewee: { select: { id: true, name: true, role: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const result = reviews.map((r) => ({
      ...r,
      perspective: r.reviewer_id === userId ? "given" : "received",
    }));

    // Add perspective flag for UI
    return result;
  }

  // Auto release payment
  @service
  private async autoReleasePayment(dealId: string) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.autoReleasePayment
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "PENDING_REVIEW" },
      after: tx,
    };
    await this.audit.logAction(AuditAction.AUTO_RELEASE, "deal", dealId, delta);

    return tx;
  }

  // Auto refund after deadline
  @service
  private async autoRefundAfterDeadline(dealId: string) {
    const tx = await this.executeTxWithDeal(
      dealId,
      contractModel.autoRefundAfterDeadline
    );

    // Log audit
    const delta: AuditChange = {
      before: { status: "ACTIVE" },
      after: tx,
    };
    await this.audit.logAction(AuditAction.AUTO_REFUND, "deal", dealId, delta);

    return tx;
  }

  // Auto-release if still pending
  @service
  private async handleAutoReleaseIfStillPending(
    dealId: string,
    creatorName: string,
    creatorEmail: string
  ) {
    const deal = await this.getDealById(dealId);

    // Skip if already resolved
    if (deal.status !== "PENDING_REVIEW") {
      console.log(`Deal ${dealId} already processed (${deal.status}).`);
      return;
    }

    console.log(
      `Auto-releasing payment for deal ${dealId} after 72h inactivity.`
    );
    await this.autoReleasePayment(dealId);

    // Notify creator
    await this.sendPaymentReleasedEmail(dealId, creatorName, creatorEmail);
  }

  // Send payment released email
  private async sendPaymentReleasedEmail(
    dealId: string,
    creatorName: string,
    creatorEmail: string
  ): Promise<void> {
    const dashboardUrl = `${env.frontEndUrl}/deals/${dealId}`;

    // Render the email using the new template
    const html = renderTemplate("payment-released", {
      NAME: creatorName || "Creator",
      DEAL_ID: dealId,
      URL: dashboardUrl,
    });

    await sendMail(creatorEmail, "Payment Released", html);
  }

  // Get deals ids
  private async getDealsIds(
    userAddress: string,
    isBrand: boolean
  ): Promise<string[]> {
    return contractModel.getDeals(userAddress, isBrand);
  }

  // Find the opposite party in a deal
  private async findOppositeParty(
    userId: string,
    dealId: string
  ): Promise<string> {
    // Fetch deal details from blockchain
    const deal = await this.getDealById(dealId);

    const [brandUser, creatorUser] = await Promise.all([
      this.prisma.user.findFirst({
        where: { wallet: { address: deal.brand } },
        select: { id: true },
      }),
      this.prisma.user.findFirst({
        where: { wallet: { address: deal.creator } },
        select: { id: true },
      }),
    ]);

    if (!brandUser || !creatorUser) {
      throw new HTTPException(404, {
        message: "Deal participants not found",
      });
    }

    if (userId === brandUser.id) return creatorUser.id;
    if (userId === creatorUser.id) return brandUser.id;

    throw new HTTPException(403, {
      message: "You are not a participant in this deal",
    });
  }

  // Get wallet address from email
  private async getWalletAddressByEmail(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { wallet: { select: { address: true } } },
    });

    if (!user || !user.wallet) {
      throw new HTTPException(404, {
        message: "User with this email not found or wallet missing",
      });
    }

    return user.wallet.address;
  }

  // Generic helper for write transactions that return tx + deal status
  private async executeTxWithDeal(
    dealId: string,
    fn: (...args: any[]) => Promise<any>,
    ...args: any[]
  ): Promise<TransactionResponse> {
    // Cancel auto-release if needed
    const shouldCancelJob = [
      "approveDeal",
      "cancelDeal",
      "emergencyCancelDeal",
      "initiateDispute",
      "resolveDispute",
    ].includes(fn.name);

    if (shouldCancelJob) {
      cancelJob(`auto-release-${dealId}`);
    }

    const transactionHash = await fn(dealId, ...args);

    await waitForTransactionReceipt(transactionHash, 2);

    const deal = await this.getDealById(dealId);

    console.log(`Deal ${dealId} status: ${deal.status}`);

    return { transaction_hash: transactionHash, status: deal.status };
  }

  // Generic helper for mapping raw deal to response
  private createDealToResponse(deal: RawDeal): DealResponse {
    const d = mapRawDeal(deal);
    if (!d.exists) {
      throw new HTTPException(404, { message: "Deal not found" });
    }

    const dealAmount = convertWadToRupiah(BigInt(d.amount));

    const isDisputeResolved = d.disputedAt && d.status === "COMPLETED";

    return {
      deal_id: d.dealId,
      brand: d.brand,
      creator: d.creator,
      amount: dealAmount,
      deadline: d.deadline,
      status: d.status,
      brief_hash: d.briefHash,
      content_url: d.contentUrl,
      dispute_reason: d.disputeReason,
      funded_at: d.fundedAt,
      submitted_at: d.submittedAt,
      review_deadline: d.reviewDeadline,
      disputed_at: d.disputedAt,
      created_at: d.createdAt,
      accepted_dispute: isDisputeResolved ? d.acceptedDispute : null,
    };
  }

  /**
   * ----------------------------------------
   * Mock IDRX methods
   * ----------------------------------------
   */
  @service
  async mintIDRX(
    userAddress: string,
    request: MintIDRXRequest
  ): Promise<TransactionResponse> {
    const transactionHash = await contractModel.mintIDRX(
      userAddress,
      request.amount
    );

    return {
      transaction_hash: transactionHash,
      status: "MINTED_SUCCESS",
    };
  }

  /**
   * ----------------------------------------
   * Brief methods
   * ----------------------------------------
   */
  @service
  async uploadBrief(
    userId: string,
    request: UploadBriefRequest
  ): Promise<UploadBriefResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HTTPException(404, { message: "User not found" });

    const briefExists = await this.prisma.brief.findUnique({
      where: { id: request.brief_hash },
    });
    if (briefExists) {
      throw new HTTPException(409, {
        message:
          "Cannot create deal with this brief, the brief is already used in another deal.",
      });
    }

    const response: UploadBriefResponse = await this.minio.generateUploadUrl(
      userId,
      request.content_type
    );

    const brief = await this.prisma.brief.create({
      data: {
        id: request.brief_hash,
        user_id: userId,
        file_url: response.file_url,
      },
    });

    // Log audit
    const delta: AuditChange = {
      after: {
        user_id: userId,
        file_url: brief.file_url,
      },
    };
    await this.audit.logAction(AuditAction.BRIEF, "brief", brief.id, delta);

    return response;
  }

  @service
  async getSecureDownloadUrl(briefHash: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id: briefHash },
    });

    if (!brief) throw new HTTPException(404, { message: "Brief not found" });

    // Derive object key from file_url
    const fileKey = brief.file_url.split(`${this.minio.bucket}/`)[1];
    const signedUrl = await this.minio.generateDownloadUrl(fileKey);

    return signedUrl;
  }

  /**
   * ----------------------------------------
   * Blockchain / contract methods
   * ----------------------------------------
   */
  @service
  async getPlatformFee(): Promise<number> {
    return Number(await contractModel.getPlatformFeeBps());
  }

  @service
  async getTokenInfo() {
    const tx = await contractModel.getTokenInfo();

    return {
      name: tx.name,
      symbol: tx.symbol,
      totalSupply: Number(tx.totalSupply),
    };
  }
}

// Dependencies injection
const minioService = new MinioService();
const auditService = new AuditService();

export const dealService = new DealService(
  prismaClient,
  minioService,
  auditService
);
