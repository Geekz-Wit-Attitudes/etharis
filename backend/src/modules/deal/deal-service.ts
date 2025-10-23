import {
  mapRawDeal,
  type CreateDealContractArgs,
  type CreateDealRequest,
  type DealResponse,
  type RawDeal,
  type TransactionResponse,
  type UploadBriefResponse,
  type MintIDRXRequest,
} from "./deal-types";

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
} from "../../common";

import type { PrismaClient } from "../../../generated/prisma";

import cuid from "cuid";
import { HTTPException } from "hono/http-exception";

const minioService = new MinioService();

export class DealService {
  private prisma: PrismaClient;
  private minio: MinioService;

  constructor(prisma: PrismaClient, minio: MinioService) {
    this.prisma = prisma;
    this.minio = minio;
  }

  // Blockchain / contract methods
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

  // Create New Deal
  async createNewDeal(
    userAddress: string,
    request: CreateDealRequest
  ): Promise<TransactionResponse> {
    return catchOrThrow(async () => {
      // Get wallet address from email
      const creatorAddress = await this.getWalletByEmail(request.email);

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

      // Schedule auto-refund after deal deadline
      scheduleJob(`auto-refund-${dealId}`, request.deadline, async () => {
        await this.autoRefundAfterDeadline(dealId);
      });

      return {
        deal_id: dealId,
        transaction_hash: transactionHash,
      };
    });
  }

  // Submit Deal Content
  async submitDealContent(
    dealId: string,
    contentUrl: string,
    creatorAddress: string,
    creatorName: string,
    creatorEmail: string
  ) {
    return catchOrThrow(async () => {
      const deal = await this.getDealById(dealId);

      if (!deal) {
        throw new AppError("Deal not found", 404);
      }

      if (creatorAddress.toLowerCase() !== deal.creator.toLowerCase()) {
        throw new AppError(
          "You are not authorized to submit for this deal",
          403
        );
      }

      if (deal.content_url && deal.status === "PENDING_REVIEW") {
        throw new AppError("Content already submitted and pending review", 409);
      }

      if (deal.status !== "ACTIVE") {
        throw new AppError(
          `Deal cannot accept content in status: ${deal.status}`,
          400
        );
      }

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

      return {
        deal_id: dealId,
        content_url: contentUrl,
        status: "PENDING_REVIEW",
      };
    });
  }

  // Auto-release if still pending
  private async handleAutoReleaseIfStillPending(
    dealId: string,
    creatorName: string,
    creatorEmail: string
  ) {
    return catchOrThrow(async () => {
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
    });
  }

  // Accept Existing Deal
  async acceptExistingDeal(dealId: string, creatorAddress: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.acceptDeal,
      creatorAddress
    );
  }

  // Approve Existing Deal
  async approveExistingDeal(dealId: string, brandAddress: string) {
    // Cancel auto-refund
    cancelJob(`auto-refund-${dealId}`);

    return this.executeTxWithDeal(
      dealId,
      contractModel.approveDeal,
      brandAddress
    );
  }

  // Fund Existing Deal
  async fundExistingDeal(
    dealId: string,
    userId: string,
    brandAddress: string,
    amount: number
  ) {
    return catchOrThrow(async () => {
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

      return response;
    });
  }

  // Initiate Dispute
  async initiateDispute(dealId: string, brandAddress: string, reason: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.initiateDispute,
      brandAddress,
      reason
    );
  }

  // Resolve Dispute
  async resolveDispute(
    dealId: string,
    creatorAddress: string,
    accept5050: boolean
  ) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.resolveDispute,
      creatorAddress,
      accept5050
    );
  }

  // Get Deal by ID
  async getDealById(dealId: string): Promise<DealResponse> {
    return catchOrThrow(async () => {
      const tx = await contractModel.getDeal(dealId);

      if (!tx) throw new HTTPException(404, { message: "Deal not found" });

      const deal = this.createDealToResponse(convertBigInts(tx));

      return deal;
    });
  }

  // Auto release payment
  async autoReleasePayment(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.autoReleasePayment);
  }

  // Auto refund after deadline
  async autoRefundAfterDeadline(dealId: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.autoRefundAfterDeadline
    );
  }

  // Cancel Deal
  async cancelDeal(dealId: string, brandAddress: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.cancelDeal,
      brandAddress
    );
  }

  // Emergency cancel
  async emergencyCancelDeal(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.emergencyCancelDeal);
  }

  // Get Deals
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
  async canAutoRelease(dealId: string): Promise<boolean> {
    return catchOrThrow(() => contractModel.canAutoRelease(dealId));
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

  // Get wallet address from email
  private async getWalletByEmail(email: string): Promise<string> {
    const user = await prismaClient.user.findUnique({
      where: { email },
      select: { wallet: { select: { address: true } } },
    });

    if (!user || !user.wallet) {
      throw new AppError("User with this email not found or wallet missing");
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

      await waitForTransactionReceipt(transactionHash);

      const deal = await contractModel.getDeal(dealId);
      const response = await this.createDealToResponse(convertBigInts(deal));

      return { transaction_hash: transactionHash, status: response.status };
    });
  }

  // Generic helper for mapping raw deal to response
  private async createDealToResponse(deal: RawDeal): Promise<DealResponse> {
    const d = mapRawDeal(deal);
    if (!d.exists) {
      throw new AppError("Deal not found", 404);
    }

    const dealAmount = convertWadToRupiah(BigInt(d.amount));

    return {
      deal_id: d.dealId,
      brand: d.brand,
      creator: d.creator,
      amount: dealAmount,
      deadline: d.deadline,
      status: d.status,
      brief_hash: d.briefHash,
      content_url: d.contentUrl,
      funded_at: d.fundedAt,
      submitted_at: d.submittedAt,
      review_deadline: d.reviewDeadline,
      created_at: d.createdAt,
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
        status: "MINTED_SUCCESS", // Status kustom untuk Minting
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
    contentType?: string
  ): Promise<UploadBriefResponse> {
    return catchOrThrow(async () => {
      const response: UploadBriefResponse = await this.minio.generateUploadUrl(
        userId,
        contentType
      );

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new HTTPException(404, { message: "User not found" });

      await this.prisma.brief.create({
        data: { user_id: userId, file_url: response.file_url },
      });

      return response;
    });
  }

  async getSecureDownloadUrl(briefId: string, userId: string) {
    return catchOrThrow(async () => {
      const brief = await this.prisma.brief.findUnique({
        where: { id: briefId },
      });

      if (!brief) throw new HTTPException(404, { message: "Brief not found" });
      if (brief.user_id !== userId) {
        throw new HTTPException(403, { message: "User not authorized" });
      }

      // Derive object key from file_url
      const fileKey = brief.file_url.split(`${this.minio.bucket}/`)[1];
      const signedUrl = await this.minio.generateDownloadUrl(fileKey);

      return signedUrl;
    });
  }
}

export const dealService = new DealService(prismaClient, minioService);
