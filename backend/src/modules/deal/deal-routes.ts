import { dealController } from "./deal-controller";

import { endpoints, authMiddleware, type GlobalTypes } from "@/common";

import { Hono } from "hono";

export const dealRoutes = new Hono<{ Variables: GlobalTypes }>();

const { platformFee, tokenInfo } = endpoints.contract;
const {
  uploadBrief,
  secureDownloadBrief,
  createDeal,
  approveDeal,
  acceptDeal,
  fundDeal,
  submitContent,
  getDeal,
  initiateDispute,
  resolveDispute,
  cancelDeal,
  getDeals,
  canAutoRelease,
  createReview,
  getReview,
  getUserReviews,
  mintMockIDRX,
} = endpoints.deal;

// Apply auth middleware
dealRoutes.use(authMiddleware);

/**
 * ----------------------------------------
 * Mount deal controller
 * ----------------------------------------
 */
// Deal
dealRoutes.get(getDeal, dealController.handleGetDeal);
dealRoutes.get(getDeals, dealController.handleGetDeals);
dealRoutes.post(createDeal, dealController.handleCreateDeal);
dealRoutes.post(fundDeal, dealController.handleFundDeal);
dealRoutes.post(acceptDeal, dealController.handleAcceptDeal);
dealRoutes.post(cancelDeal, dealController.handleCancelDeal);
dealRoutes.post(submitContent, dealController.handleSubmitContent);
dealRoutes.post(approveDeal, dealController.handleApproveDeal);
dealRoutes.post(initiateDispute, dealController.handleInitiateDispute);
dealRoutes.post(resolveDispute, dealController.handleResolveDispute);
dealRoutes.post(canAutoRelease, dealController.handleCanAutoRelease);
dealRoutes.post(createReview, dealController.handleCreateDealReview);
dealRoutes.post(getReview, dealController.handleGetDealReview);
dealRoutes.post(getUserReviews, dealController.handleGetUserReviews);

// Mock IDRX
dealRoutes.post(mintMockIDRX, dealController.handleMintIDRX);

// Blockchain Info
dealRoutes.get(platformFee, dealController.handleGetPlatformFee);
dealRoutes.get(tokenInfo, dealController.handleGetTokenInfo);

// Brief
dealRoutes.post(uploadBrief, dealController.handleUploadBrief);
dealRoutes.get(secureDownloadBrief, dealController.handleSecureBrief);
