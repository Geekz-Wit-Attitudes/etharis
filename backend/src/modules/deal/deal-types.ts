import { contractStatus } from "../auth";
import {
  RawDealSchema,
  type ApproveDealSchema,
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
export type CanAutoReleaseRequest = z.infer<typeof CanAutoReleaseSchema>;

/* Contract Args DTOs */
export type CreateDealContractArgs = {
  dealId: string;
  brand: string;
  creator: string;
  amount: number;
  deadline: number;
  briefHash: string;
};

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
  amount: number;
  deadline: number;
  status: string;
  brief_hash: string;
  content_url: string | null;
  review_deadline: number | null;
  funded_at: number | null;
  submitted_at: number | null;
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
    reviewDeadline,
    fundedAt,
    submittedAt,
    exists,
  ] = RawDealSchema.parse(deal);

  const statusNumber = Number(status);
  const statusString = contractStatusMap[statusNumber];

  if (isNaN(statusNumber) || !statusString) {
    throw new Error("Invalid deal status");
  }

  return {
    dealId,
    brand,
    creator,
    amount: Number(amount),
    deadline: Number(deadline),
    status: statusString ?? statusNumber,
    briefHash,
    contentUrl: contentUrl || null,
    reviewDeadline: Number(reviewDeadline),
    fundedAt: Number(fundedAt),
    submittedAt: Number(submittedAt),
    exists: exists ?? true,
  };
};
