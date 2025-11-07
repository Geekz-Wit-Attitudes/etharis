import { AppError } from "@/common";
import {
  RawDealSchema,
  type ApproveDealSchema,
  type AcceptDealSchema,
  type CreateDealSchema,
  type FundDealSchema,
  type GetDealQuerySchema,
  type GetDealsQuerySchema,
  type InitiateDisputeSchema,
  type ResolveDisputeSchema,
  type SubmitContentSchema,
  type UploadBriefSchema,
  type AutoReleasePaymentSchema,
  type AutoRefundAfterDeadlineSchema,
  type CancelDealSchema,
  type EmergencyCancelDealSchema,
  type CanAutoReleaseSchema,
  type MintIDRXSchema,
  type CreateDealReviewSchema,
  type GetDealReviewQuerySchema,
} from "./deal-validation";

import type z from "zod";

/**
 * ----------------------------------------
 * Request DTOs
 * ----------------------------------------
 */
/* JSON Request DTOs */
export type RawDeal = z.infer<typeof RawDealSchema>;
export type GetDealQuery = z.infer<typeof GetDealQuerySchema>;
export type GetDealsQuery = z.infer<typeof GetDealsQuerySchema>;
export type CreateDealRequest = z.infer<typeof CreateDealSchema>;
export type ApproveDealRequest = z.infer<typeof ApproveDealSchema>;
export type AcceptDealRequest = z.infer<typeof AcceptDealSchema>;
export type FundDealRequest = z.infer<typeof FundDealSchema>;
export type SubmitContentRequest = z.infer<typeof SubmitContentSchema>;
export type InitiateDisputeRequest = z.infer<typeof InitiateDisputeSchema>;
export type ResolveDisputeRequest = z.infer<typeof ResolveDisputeSchema>;
export type UploadBriefRequest = z.infer<typeof UploadBriefSchema>;
export type AutoReleasePaymentRequest = z.infer<
  typeof AutoReleasePaymentSchema
>;
export type AutoRefundAfterDeadlineRequest = z.infer<
  typeof AutoRefundAfterDeadlineSchema
>;
export type CancelDealRequest = z.infer<typeof CancelDealSchema>;
export type EmergencyCancelDealRequest = z.infer<
  typeof EmergencyCancelDealSchema
>;
export type CreateDealReviewRequest = z.infer<typeof CreateDealReviewSchema>;
export type GetDealReviewQuery = z.infer<typeof GetDealReviewQuerySchema>;

export type CanAutoReleaseRequest = z.infer<typeof CanAutoReleaseSchema>;
export type MintIDRXRequest = z.infer<typeof MintIDRXSchema>;

/* Contract Args DTOs */
export type CreateDealContractArgs = {
  dealId: string;
  brand: string;
  creator: string;
  amount: bigint;
  deadline: number;
  briefHash: string;
};

export const contractStatus = {
  PENDING: 0,
  ACTIVE: 1,
  PENDING_REVIEW: 2,
  DISPUTED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
} as const;

export type ContractStatus =
  (typeof contractStatus)[keyof typeof contractStatus];

/**
 * ----------------------------------------
 * Response DTOs
 * ----------------------------------------
 */

export type TransactionResponse = {
  transaction_hash: string;
  status?: string;
  deal_id?: string;
};

export type DealResponse = {
  deal_id: string;
  brand: string;
  creator: string;
  amount: string;
  deadline: number;
  status: string;
  brief_hash: string;
  content_url: string | null;
  dispute_reason: string | null;
  review_deadline: number | null;
  funded_at: number | null;
  submitted_at: number | null;
  disputed_at: number | null;
  created_at: number | null;
  accepted_dispute: boolean | null;
};

export type UploadBriefResponse = {
  upload_url: string;
  file_url: string;
};

/**
 * ----------------------------------------
 * Mapper
 * ----------------------------------------
 */

const contractStatusMap = Object.entries(contractStatus).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<number, string>
);

export const mapRawDeal = (deal: RawDeal) => {
  const [
    dealId,
    brand,
    creator,
    amount,
    deadline,
    status,
    briefHash,
    contentUrl,
    disputeReason,
    reviewDeadline,
    fundedAt,
    submittedAt,
    disputedAt,
    createdAt,
    acceptedDispute,
    exists,
  ] = RawDealSchema.parse(deal);

  const statusNumber = Number(status);
  const statusString = contractStatusMap[statusNumber];

  if (isNaN(statusNumber) || !statusString) {
    throw new AppError("Invalid deal status", 400);
  }

  return {
    dealId,
    brand,
    creator,
    amount: amount,
    deadline: Number(deadline),
    status: statusString ?? statusNumber,
    briefHash,
    contentUrl: contentUrl || null,
    disputeReason: disputeReason || null,
    reviewDeadline: Number(reviewDeadline),
    fundedAt: Number(fundedAt),
    submittedAt: Number(submittedAt),
    disputedAt: Number(disputedAt),
    createdAt: Number(createdAt),
    acceptedDispute: acceptedDispute ?? null,
    exists: exists ?? true,
  };
};
