import z from "zod";

// Generate brief upload request validation
export const UploadBriefSchema = z.object({
  content_type: z.string().optional(), // optional: can add regex for MIME type
});
