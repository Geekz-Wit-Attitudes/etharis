import {
  mapRawDeal,
  type CreateDealRequest,
  type DealResponse,
  type RawDeal,
  type TransactionResponse,
  type UploadBriefResponse,
} from "./deal-types";

import {
  catchOrThrow,
  contractModel,
  convertBigInts,
  prismaClient,
  MinioService,
} from "../../common";

import type { PrismaClient } from "../../../generated/prisma";

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

  async createNewDeal(request: CreateDealRequest) {
    return catchOrThrow(() => contractModel.createDeal(request));
  }

  async approveExistingDeal(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.approveDeal);
  }

  async fundExistingDeal(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.fundDeal);
  }

  async submitDealContent(dealId: string, contentUrl: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.submitContent,
      contentUrl
    );
  }

  async initiateDispute(dealId: string, reason: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.initiateDispute,
      reason
    );
  }

  async resolveDispute(dealId: string, accept8020: boolean) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.resolveDispute,
      accept8020
    );
  }

  async getDealById(dealId: string): Promise<DealResponse> {
    return catchOrThrow(async () => {
      const tx = await contractModel.getDeal(dealId);

      if (!tx) throw new HTTPException(404, { message: "Deal not found" });

      const deal = this.createDealToResponse(convertBigInts(tx));

      return deal;
    });
  }

  // Generic helper for write transactions that return tx + deal status
  private async executeTxWithDeal(
    dealId: string,
    fn: (...args: any[]) => Promise<any>,
    ...args: any[]
  ): Promise<TransactionResponse> {
    return catchOrThrow(async () => {
      const tx = await fn(...args);

      const deal = await contractModel.getDeal(dealId);
      const response = await this.createDealToResponse(convertBigInts(deal));

      return { tx_hash: tx.hash, status: response.status };
    });
  }

  // Generic helper for mapping raw deal to response
  private async createDealToResponse(deal: RawDeal): Promise<DealResponse> {
    const d = mapRawDeal(deal);
    if (!d.exists) {
      throw new HTTPException(404, { message: "Deal not found" });
    }

    return {
      deal_id: d.dealId,
      brand: d.brand,
      creator: d.creator,
      amount: d.amount,
      deadline: d.deadline,
      status: d.status,
      brief_hash: d.briefHash,
      content_url: d.contentUrl,
      funded_at: d.fundedAt,
      submitted_at: d.submittedAt,
      review_deadline: d.reviewDeadline,
    };
  }

  // Brief methods
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

  async autoReleasePayment(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.autoReleasePayment);
  }

  async autoRefundAfterDeadline(dealId: string) {
    return this.executeTxWithDeal(
      dealId,
      contractModel.autoRefundAfterDeadline
    );
  }

  async cancelDeal(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.cancelDeal);
  }

  async emergencyCancelDeal(dealId: string) {
    return this.executeTxWithDeal(dealId, contractModel.emergencyCancelDeal);
  }

  async getDeals(userAddress: string, isBrand: boolean): Promise<string[]> {
    return catchOrThrow(() => contractModel.getDeals(userAddress, isBrand));
  }

  async canAutoRelease(dealId: string): Promise<boolean> {
    return catchOrThrow(() => contractModel.canAutoRelease(dealId));
  }
}

export const dealService = new DealService(prismaClient, minioService);
