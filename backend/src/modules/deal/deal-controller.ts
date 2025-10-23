import { AppError, validateRequestJson, validateRequestQuery } from "@/common";
import {
  dealService,
  GetDealQuerySchema,
  GetDealsQuerySchema,
  CreateDealSchema,
  ApproveDealSchema,
  AcceptDealSchema,
  FundDealSchema,
  SubmitContentSchema,
  InitiateDisputeSchema,
  ResolveDisputeSchema,
  AutoReleasePaymentSchema,
  AutoRefundAfterDeadlineSchema,
  CancelDealSchema,
  EmergencyCancelDealSchema,
  CanAutoReleaseSchema,
  UploadBriefSchema,
  MintIDRXSchema,
  type CreateDealRequest,
  type ApproveDealRequest,
  type FundDealRequest,
  type SubmitContentRequest,
  type InitiateDisputeRequest,
  type ResolveDisputeRequest,
  type GetDealQuery,
  type GetDealsQuery,
  type AutoReleasePaymentRequest,
  type AutoRefundAfterDeadlineRequest,
  type CancelDealRequest,
  type EmergencyCancelDealRequest,
  type CanAutoReleaseRequest,
  type UploadBriefRequest,
  type MintIDRXRequest,
  type AcceptDealRequest,
} from "@/modules/deal";

import type { Handler } from "hono";
import { UserRole } from "../../../generated/prisma";

export class DealController {
  // Get platform fee
  public handleGetPlatformFee: Handler = async (c) => {
    const data = await dealService.getPlatformFee();

    return c.json({ data });
  };

  // Get token info
  public handleGetTokenInfo: Handler = async (c) => {
    const result = await dealService.getTokenInfo();

    return c.json({ data: result });
  };

  public handleMintIDRX: Handler = validateRequestJson(
    MintIDRXSchema,
    async (c, data: MintIDRXRequest) => {
      const user = c.get("user");

      const userAddress = user.wallet.address;

      if (!userAddress) throw new AppError("User wallet address not found");

      const response = await dealService.mintIDRX(userAddress, data);

      return c.json({ data: response });
    }
  );

  // Create a new deal
  public handleCreateDeal: Handler = validateRequestJson(
    CreateDealSchema,
    async (c, data: CreateDealRequest) => {
      const user = c.get("user");
      const userAddress = user.wallet.address;

      if (!userAddress) throw new AppError("User address not found");

      if (user.email === data.email) {
        throw new AppError("Cannot create deal for yourself");
      }

      if (user.role !== UserRole.BRAND) {
        throw new AppError("Only brands can create deals");
      }

      const response = await dealService.createNewDeal(userAddress, data);

      return c.json({ data: response });
    }
  );

  // Approve an existing deal
  public handleApproveDeal: Handler = validateRequestJson(
    ApproveDealSchema,
    async (c, data: ApproveDealRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.BRAND) {
        throw new AppError("Only brands can approve deals");
      }

      const brandAddress = user.wallet.address;

      const response = await dealService.approveExistingDeal(
        data.deal_id,
        brandAddress
      );

      return c.json({ data: response });
    }
  );

  public handleAcceptDeal: Handler = validateRequestJson(
    AcceptDealSchema,
    async (c, data: AcceptDealRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.CREATOR) {
        throw new AppError("Only creator can accept deals");
      }

      const creatorAddress = user.wallet.address;

      const response = await dealService.acceptExistingDeal(
        data.deal_id,
        creatorAddress
      );

      return c.json({ data: response });
    }
  );

  // Fund an existing deal
  public handleFundDeal: Handler = validateRequestJson(
    FundDealSchema,
    async (c, data: FundDealRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.BRAND) {
        throw new AppError("Only brands can fund deals");
      }

      const userId = user.id;
      const brandAddress = user.wallet.address;

      const response = await dealService.fundExistingDeal(
        data.deal_id,
        userId,
        brandAddress,
        data.amount
      );

      return c.json({ data: response });
    }
  );

  // Submit content for a deal
  public handleSubmitContent: Handler = validateRequestJson(
    SubmitContentSchema,
    async (c, data: SubmitContentRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.CREATOR) {
        throw new AppError("Only creators can resolve disputes");
      }

      const creatorAddress = user.wallet.address;

      const response = await dealService.submitDealContent(
        data.deal_id,
        data.content_url,
        creatorAddress,
        user.name,
        user.email
      );

      return c.json({ data: response });
    }
  );

  // Get deal details
  public handleGetDeal: Handler = validateRequestQuery(
    GetDealQuerySchema,
    async (c, data: GetDealQuery) => {
      const dealId = data.id;

      const response = await dealService.getDealById(dealId);

      return c.json({ data: response });
    }
  );

  // Initiate a dispute
  public handleInitiateDispute: Handler = validateRequestJson(
    InitiateDisputeSchema,
    async (c, data: InitiateDisputeRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.BRAND) {
        throw new AppError("Only brands can initiate disputes");
      }

      const brandAddress = user.wallet.address;

      const response = await dealService.initiateDispute(
        data.deal_id,
        brandAddress,
        data.reason
      );

      return c.json({ data: response });
    }
  );

  // Resolve a dispute
  public handleResolveDispute: Handler = validateRequestJson(
    ResolveDisputeSchema,
    async (c, data: ResolveDisputeRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.CREATOR) {
        throw new AppError("Only creators can resolve disputes");
      }

      const creatorAddress = user.wallet.address;

      const response = await dealService.resolveDispute(
        data.deal_id,
        creatorAddress,
        data.accept5050
      );

      return c.json({ data: response });
    }
  );

  // Generate upload brief
  public handleUploadBrief: Handler = validateRequestJson(
    UploadBriefSchema,
    async (c, data: UploadBriefRequest) => {
      const user = c.get("user");

      const response = await dealService.uploadBrief(
        user.id,
        data.content_type
      );

      return c.json({ data: response });
    }
  );

  // Auto release payment
  public handleAutoReleasePayment: Handler = validateRequestJson(
    AutoReleasePaymentSchema,
    async (c, data: AutoReleasePaymentRequest) => {
      const response = await dealService.autoReleasePayment(data.deal_id);

      return c.json({ data: response });
    }
  );

  // Auto refund
  public handleAutoRefundAfterDeadline: Handler = validateRequestJson(
    AutoRefundAfterDeadlineSchema,
    async (c, data: AutoRefundAfterDeadlineRequest) => {
      const response = await dealService.autoRefundAfterDeadline(data.deal_id);

      return c.json({ data: response });
    }
  );

  // Cancel deal
  public handleCancelDeal: Handler = validateRequestJson(
    CancelDealSchema,
    async (c, data: CancelDealRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.BRAND) {
        throw new AppError("Only brands can cancel deals");
      }

      const brandAddress = user.wallet.address;

      const response = await dealService.cancelDeal(data.deal_id, brandAddress);

      return c.json({ data: response });
    }
  );

  // Emergency cancel deal
  public handleEmergencyCancelDeal: Handler = validateRequestJson(
    EmergencyCancelDealSchema,
    async (c, data: EmergencyCancelDealRequest) => {
      const user = c.get("user");

      if (user.role !== UserRole.ADMIN) {
        throw new AppError("Only admin can do emergency cancel deals");
      }

      const response = await dealService.emergencyCancelDeal(data.deal_id);

      return c.json({ data: response });
    }
  );

  // Get deals
  public handleGetDeals: Handler = validateRequestQuery(
    GetDealsQuerySchema,
    async (c, query: GetDealsQuery) => {
      const user = c.get("user");
      const userAddress = user.wallet.address;
      const isBrand = user.role === UserRole.BRAND;

      let { limit, page } = query;

      // Fetch all user deals
      const deals = await dealService.getDeals(userAddress, isBrand);

      if (limit === undefined) limit = deals.length;
      if (page === undefined) page = 1;

      const offset = (page - 1) * limit;
      const paginated = deals.slice(offset, offset + limit);

      const totalPages = Math.ceil(deals.length / limit);

      return c.json({
        data: paginated,
        meta: {
          page,
          limit,
          total: deals.length,
          total_pages: totalPages,
        },
      });
    }
  );

  // Can auto release
  public handleCanAutoRelease: Handler = validateRequestJson(
    CanAutoReleaseSchema,
    async (c, data: CanAutoReleaseRequest) => {
      const result = await dealService.canAutoRelease(data.deal_id);

      return c.json({ data: result });
    }
  );

  // Get secure brief
  public handleSecureBrief: Handler = async (c) => {
    const briefId = c.req.param("id");
    const user = c.get("user");

    const response = await dealService.getSecureDownloadUrl(briefId, user.id);

    return c.json({ data: response });
  };
}

export const dealController = new DealController();
