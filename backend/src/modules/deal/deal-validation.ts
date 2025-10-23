import z from "zod";

// Raw Deal Schema
export const RawDealSchema = z.tuple([
  z.string(), // dealId
  z.string(), // brand
  z.string(), // creator
  z.union([z.string(), z.number(), z.bigint()]), // amount
  z.union([z.string(), z.number()]), // deadline
  z.union([z.string(), z.number()]), // status (ContractStatus)
  z.string(), // briefHash
  z.string(), // contentUrl
  z.string(), // disputeReason
  z.union([z.string(), z.number()]), // reviewDeadline
  z.union([z.string(), z.number()]), // fundedAt
  z.union([z.string(), z.number()]), // submittedAt
  z.union([z.string(), z.number()]), // disputedAt
  z.union([z.string(), z.number()]), // createdAt
  z.boolean().optional(), // acceptedDispute
  z.boolean().optional(), // exists (optional)
]);

// Get Deal request validation
export const GetDealQuerySchema = z.object({
  id: z.string().min(1, "Deal ID is required"),
});

// Get Deals
export const GetDealsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || (v > 0 && v <= 100), {
      message: "Limit must be between 1 and 100",
    }),

  page: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || v >= 1, {
      message: "Page must be 1 or higher",
    }),
});

// Create Deal request validation
export const CreateDealSchema = z.object({
  email: z.email("Invalid email format").max(100),
  amount: z.number().positive("Amount must be greater than 0"),
  deadline: z.number().int().positive("Deadline must be a positive timestamp"),
  brief_hash: z.string().min(1, "Brief hash is required"),
});

// Approve Deal request validation
export const ApproveDealSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Accept Deal request validation
export const AcceptDealSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Fund Deal request validation
export const FundDealSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
  amount: z
    .number()
    .int()
    .min(10000, "Jumlah Top Up minimal Rp 10.000")
    .max(100000000, "Jumlah Top Up maksimal Rp 100.000.000"),
});

// Submit Content request validation
export const SubmitContentSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
  content_url: z
    .url()
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("ipfs://"),
      "Content URL must be a secure or decentralized link"
    ),
});

// Initiate Dispute request validation
export const InitiateDisputeSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

// Resolve Dispute request validation
export const ResolveDisputeSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
  is_accept_dispute: z.boolean(),
});

// Auto Release Payment request
export const AutoReleasePaymentSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Auto Refund After Deadline request
export const AutoRefundAfterDeadlineSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Cancel Deal request
export const CancelDealSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Emergency Cancel Deal request
export const EmergencyCancelDealSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Can Auto Release request
export const CanAutoReleaseSchema = z.object({
  deal_id: z.string().min(1, "Deal ID is required"),
});

// Generate brief upload request validation
export const UploadBriefSchema = z.object({
  brief_hash: z.string().min(1, "Brief hash is required"), // optional
  content_type: z.string().optional(), // optional
});

export const MintIDRXSchema = z.object({
  amount: z
    .number()
    .int()
    .min(10000, "Jumlah Top Up minimal Rp 10.000")
    .max(100000000, "Jumlah Top Up maksimal Rp 100.000.000"),
});
