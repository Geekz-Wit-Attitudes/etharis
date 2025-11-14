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
import { AuditService } from "@/modules/audit/audit-service";
import {
  env,
  catchOrThrow,
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
  AppError,
  MinioService,
  HOUR,
} from "@/common";

import { AuditAction, type PrismaClient } from "../../../generated/prisma";

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
  async createNewDeal(
    userAddress: string,
    request: CreateDealRequest
  ): Promise<TransactionResponse> {
    return catchOrThrow(
      async () => {
        // Get wallet address from email
        const creatorAddress = await this.getWalletAddressByEmail(
          request.email
        );

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
        await this.audit.logAction("deal", dealId, AuditAction.CREATE, {
          after: {
            deal_id: dealId,
            brand: userAddress,
            creator: creatorAddress,
            amount: request.amount,
            deadline: request.deadline,
            brief_hash: request.brief_hash,
            transaction_hash: transactionHash,
          },
        });

        // Schedule auto-refund after deal deadline
        scheduleJob(`auto-refund-${dealId}`, request.deadline, async () => {
          await this.autoRefundAfterDeadline(dealId);
        });

        return {
          deal_id: dealId,
          transaction_hash: transactionHash,
        };
      },
      {
        args: { userAddress, request },
      }
    );
  }

  // Submit Deal Content
  async submitDealContent(
    dealId: string,
    contentUrl: string,
    creatorAddress: string,
    creatorName: string,
    creatorEmail: string
  ) {
    return catchOrThrow(
      async () => {
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
        await this.audit.logAction("deal", dealId, AuditAction.SUBMIT, {
          after: { content_url: contentUrl, status: "PENDING_REVIEW" },
        });

        return {
          deal_id: dealId,
          content_url: contentUrl,
          status: "PENDING_REVIEW",
        };
      },
      { args: { dealId, contentUrl, creatorAddress } }
    );
  }

  // Accept Existing Deal
  async acceptExistingDeal(dealId: string, creatorAddress: string) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.acceptDeal,
          creatorAddress
        );

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.ACCEPT, {
          after: { status: tx.status },
        });

        return tx;
      },
      {
        args: { dealId, creatorAddress },
      }
    );
  }

  // Approve Existing Deal
  async approveExistingDeal(dealId: string, brandAddress: string) {
    return catchOrThrow(
      async () => {
        // Cancel auto-refund
        cancelJob(`auto-refund-${dealId}`);

        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.approveDeal,
          brandAddress
        );

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.APPROVE, {
          after: { status: tx.status },
        });

        return tx;
      },
      {
        args: { dealId, brandAddress },
      }
    );
  }

  // Fund Existing Deal
  async fundExistingDeal(
    dealId: string,
    userId: string,
    brandAddress: string,
    amount: number
  ) {
    return catchOrThrow(
      async () => {
        const before = { status: "PENDING" };

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

        const after = { status: "ACTIVE", amount, transaction_hash: response };

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.FUND, {
          before,
          after,
        });

        return response;
      },
      {
        args: { dealId, userId, brandAddress, amount },
      }
    );
  }

  // Initiate Dispute
  async initiateDispute(dealId: string, brandAddress: string, reason: string) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.initiateDispute,
          brandAddress,
          reason
        );

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.DISPUTE, {
          after: { status: tx.status, reason },
        });

        return tx;
      },
      {
        args: { dealId, brandAddress, reason },
      }
    );
  }

  // Resolve Dispute
  async resolveDispute(
    dealId: string,
    creatorAddress: string,
    isAcceptDispute: boolean
  ) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.resolveDispute,
          creatorAddress,
          isAcceptDispute
        );

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.RESOLVE, {
          after: { status: tx.status, accepted: isAcceptDispute },
        });

        return tx;
      },
      {
        args: { dealId, creatorAddress, isAcceptDispute },
      }
    );
  }

  // Get Deal by ID
  async getDealById(dealId: string): Promise<DealResponse> {
    return catchOrThrow(
      async () => {
        const tx = await contractModel.getDeal(dealId);

        if (!tx) throw new AppError("Deal not found", 404);

        const deal = this.createDealToResponse(convertBigInts(tx));

        return deal;
      },
      {
        args: { dealId },
      }
    );
  }

  // Cancel Deal
  async cancelDeal(dealId: string, brandAddress: string) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.cancelDeal,
          brandAddress
        );

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.CANCEL, {
          after: { status: tx.status },
        });

        return tx;
      },
      {
        args: { dealId, brandAddress },
      }
    );
  }

  // Emergency cancel
  async emergencyCancelDeal(dealId: string) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.emergencyCancelDeal
        );

        // Log audit
        await this.audit.logAction(
          "deal",
          dealId,
          AuditAction.EMERGENCY_CANCEL,
          {
            after: { status: tx.status },
          }
        );

        return tx;
      },
      {
        args: { dealId },
      }
    );
  }

  // Get Deals
  async getDeals(
    userAddress: string,
    isBrand: boolean
  ): Promise<DealResponse[]> {
    return catchOrThrow(
      async () => {
        const dealIds = await this.getDealsIds(userAddress, isBrand);

        // Fetch all deals in one go if possible
        const deals = await Promise.all(
          dealIds.map((dealId: string) => this.getDealById(dealId))
        );

        return deals;
      },
      {
        args: { userAddress, isBrand },
      }
    );
  }

  // Can auto release
  async canAutoRelease(dealId: string): Promise<boolean> {
    return catchOrThrow(() => contractModel.canAutoRelease(dealId), {
      args: { dealId },
    });
  }

  // Create Review
  async createDealReview(userId: string, data: CreateDealReviewRequest) {
    return catchOrThrow(
      async () => {
        // Determine the reviewee based on the deal reviewer
        const revieweeId = await this.findOppositeParty(userId, data.id);

        // Check if already reviewed
        const existing = await prismaClient.review.findUnique({
          where: {
            one_review_per_user_pair_per_deal: {
              deal_id: data.id,
              reviewer_id: userId,
              reviewee_id: revieweeId,
            },
          },
        });

        if (existing) {
          throw new AppError("You have already reviewed this deal", 409);
        }

        const review = await prismaClient.review.create({
          data: {
            deal_id: data.id,
            reviewer_id: userId,
            reviewee_id: revieweeId,
            rating: data.rating,
            comment: data.comment,
          },
        });

        return review;
      },
      {
        args: { userId, data },
      }
    );
  }

  // Get Review
  async getDealReviewById(dealId: string) {
    return catchOrThrow(
      async () => {
        const reviews = await prismaClient.review.findMany({
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
      },
      {
        args: { dealId },
      }
    );
  }

  async getUserReviews(userId: string) {
    return catchOrThrow(
      async () => {
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
      },
      {
        args: { userId },
      }
    );
  }

  // Auto release payment
  private async autoReleasePayment(dealId: string) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.autoReleasePayment
        );

        // Log audit
        await this.audit.logAction("deal", dealId, AuditAction.AUTO_RELEASE, {
          after: { status: tx.status },
        });

        return tx;
      },
      {
        args: { dealId },
      }
    );
  }

  // Auto refund after deadline
  private async autoRefundAfterDeadline(dealId: string) {
    return catchOrThrow(
      async () => {
        const tx = await this.executeTxWithDeal(
          dealId,
          contractModel.autoRefundAfterDeadline
        );

        await this.audit.logAction("deal", dealId, AuditAction.AUTO_REFUND, {
          after: { status: tx.status },
        });

        return tx;
      },
      {
        args: { dealId },
      }
    );
  }

  // Auto-release if still pending
  private async handleAutoReleaseIfStillPending(
    dealId: string,
    creatorName: string,
    creatorEmail: string
  ) {
    return catchOrThrow(
      async () => {
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
      },
      {
        args: { dealId },
      }
    );
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
    return catchOrThrow(() => contractModel.getDeals(userAddress, isBrand));
  }

  // Find the opposite party in a deal
  private async findOppositeParty(
    userId: string,
    dealId: string
  ): Promise<string> {
    // Fetch deal details from blockchain
    const deal = await this.getDealById(dealId);

    const [brandUser, creatorUser] = await Promise.all([
      prismaClient.user.findFirst({
        where: { wallet: { address: deal.brand } },
        select: { id: true },
      }),
      prismaClient.user.findFirst({
        where: { wallet: { address: deal.creator } },
        select: { id: true },
      }),
    ]);

    if (!brandUser || !creatorUser) {
      throw new AppError("Deal participants not found", 404);
    }

    if (userId === brandUser.id) return creatorUser.id;
    if (userId === creatorUser.id) return brandUser.id;

    throw new AppError("You are not a participant in this deal", 403);
  }

  // Get wallet address from email
  private async getWalletAddressByEmail(email: string): Promise<string> {
    const user = await prismaClient.user.findUnique({
      where: { email },
      select: { wallet: { select: { address: true } } },
    });

    if (!user || !user.wallet) {
      throw new AppError(
        "User with this email not found or wallet missing",
        404
      );
    }

    return user.wallet.address;
  }

  // Generic helper for write transactions that return tx + deal status
  private async executeTxWithDeal(
    dealId: string,
    fn: (...args: any[]) => Promise<any>,
    ...args: any[]
  ): Promise<TransactionResponse> {
    return catchOrThrow(async () => {
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
    });
  }

  // Generic helper for mapping raw deal to response
  private async createDealToResponse(deal: RawDeal): Promise<DealResponse> {
    const d = mapRawDeal(deal);
    if (!d.exists) {
      throw new AppError("Deal not found", 404);
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
  // Mint IDRX
  async mintIDRX(
    userAddress: string,
    request: MintIDRXRequest
  ): Promise<TransactionResponse> {
    return catchOrThrow(async () => {
      const transactionHash = await contractModel.mintIDRX(
        userAddress,
        request.amount
      );

      return {
        transaction_hash: transactionHash,
        status: "MINTED_SUCCESS",
      };
    });
  }

  /**
   * ----------------------------------------
   * Brief methods
   * ----------------------------------------
   */

  async uploadBrief(
    userId: string,
    request: UploadBriefRequest
  ): Promise<UploadBriefResponse> {
    return catchOrThrow(async () => {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError("User not found", 404);

      const briefExists = await this.prisma.brief.findUnique({
        where: { id: request.brief_hash },
      });
      if (briefExists) {
        throw new AppError(
          "Cannot create deal with this brief, the brief is already used in another deal.",
          409
        );
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
      await this.audit.logAction("brief", brief.id, AuditAction.BRIEF, {
        after: {
          user_id: userId,
          file_url: brief.file_url,
        },
      });

      return response;
    });
  }

  async getSecureDownloadUrl(briefHash: string) {
    return catchOrThrow(async () => {
      const brief = await this.prisma.brief.findUnique({
        where: { id: briefHash },
      });

      if (!brief) throw new AppError("Brief not found", 404);

      // Derive object key from file_url
      const fileKey = brief.file_url.split(`${this.minio.bucket}/`)[1];
      const signedUrl = await this.minio.generateDownloadUrl(fileKey);

      return signedUrl;
    });
  }

  /**
   * ----------------------------------------
   * Blockchain / contract methods
   * ----------------------------------------
   */
  async getPlatformFee(): Promise<number> {
    return catchOrThrow(async () =>
      Number(await contractModel.getPlatformFeeBps())
    );
  }

  async getTokenInfo() {
    return catchOrThrow(async () => {
      const tx = await contractModel.getTokenInfo();

      return {
        name: tx.name,
        symbol: tx.symbol,
        totalSupply: Number(tx.totalSupply),
      };
    });
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
