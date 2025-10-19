import { validateRequestJson, validateRequestParams } from "@/common";
import { waitForTransactionReceipt } from "@/common/utils/contract";
import {
  dealService,
  GetDealParamsSchema,
  CreateDealSchema,
  ApproveDealSchema,
  FundDealSchema,
  SubmitContentSchema,
  InitiateDisputeSchema,
  ResolveDisputeSchema,
  AutoReleasePaymentSchema,
  AutoRefundAfterDeadlineSchema,
  CancelDealSchema,
  EmergencyCancelDealSchema,
  GetDealsSchema,
  CanAutoReleaseSchema,
  UploadBriefSchema,
  type CreateDealRequest,
  type ApproveDealRequest,
  type FundDealRequest,
  type SubmitContentRequest,
  type InitiateDisputeRequest,
  type ResolveDisputeRequest,
  type GetDealParams,
  type AutoReleasePaymentRequest,
  type AutoRefundAfterDeadlineRequest,
  type CancelDealRequest,
  type EmergencyCancelDealRequest,
  type GetDealsRequest,
  type CanAutoReleaseRequest,
  type UploadBriefRequest,
} from "@/modules/deal";

import type { Handler } from "hono";

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

  // Create a new deal
  public handleCreateDeal: Handler = validateRequestJson(
    CreateDealSchema,
    async (c, data: CreateDealRequest) => {
      const response = await dealService.createNewDeal(data);

      return c.json({ data: { transaction_hash: response } });
    }
  );

  // Approve an existing deal
  public handleApproveDeal: Handler = validateRequestJson(
    ApproveDealSchema,
    async (c, data: ApproveDealRequest) => {
      const response = await dealService.approveExistingDeal(data.deal_id);

      return c.json({ data: response });
    }
  );

  // Fund an existing deal
  public handleFundDeal: Handler = validateRequestJson(
    FundDealSchema,
    async (c, data: FundDealRequest) => {
      const response = await dealService.fundExistingDeal(data.deal_id);

      return c.json({ data: response });
    }
  );

  // Submit content for a deal
  public handleSubmitContent: Handler = validateRequestJson(
    SubmitContentSchema,
    async (c, data: SubmitContentRequest) => {
      const response = await dealService.submitDealContent(
        data.deal_id,
        data.content_url
      );

      return c.json({ data: response });
    }
  );

  // Get deal details
  public handleGetDeal: Handler = validateRequestParams(
    GetDealParamsSchema,
    async (c, data: GetDealParams) => {
      const dealId = data.id;
      const response = await dealService.getDealById(dealId);

      return c.json({ data: response });
    }
  );

  // Initiate a dispute
  public handleInitiateDispute: Handler = validateRequestJson(
    InitiateDisputeSchema,
    async (c, data: InitiateDisputeRequest) => {
      const response = await dealService.initiateDispute(
        data.deal_id,
        data.reason
      );

      return c.json({ data: response });
    }
  );

  // Resolve a dispute
  public handleResolveDispute: Handler = validateRequestJson(
    ResolveDisputeSchema,
    async (c, data: ResolveDisputeRequest) => {
      const response = await dealService.resolveDispute(
        data.deal_id,
        data.accept8020
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
      const response = await dealService.cancelDeal(data.deal_id);
      return c.json({ data: response });
    }
  );

  // Emergency cancel deal
  public handleEmergencyCancelDeal: Handler = validateRequestJson(
    EmergencyCancelDealSchema,
    async (c, data: EmergencyCancelDealRequest) => {
      const response = await dealService.emergencyCancelDeal(data.deal_id);
      return c.json({ data: response });
    }
  );

  // Get deals
  public handleGetDeals: Handler = validateRequestJson(
    GetDealsSchema,
    async (c, data: GetDealsRequest) => {
      const deals = await dealService.getDeals(
        data.user_address,
        data.is_brand
      );
      return c.json({ data: deals });
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
