import type { UploadBriefSchema } from "./deal-validation";

import type z from "zod";

/**
 * ----------------------------------------
 * Request DTOs
 * ----------------------------------------
 */

export type UploadBriefRequest = z.infer<typeof UploadBriefSchema>;

/**
 * ----------------------------------------
 * Response DTOs
 * ----------------------------------------
 */

export type UploadBriefResponse = {
  upload_url: string;
  file_url: string;
};

/**
 * ----------------------------------------
 * Mapper
 * ----------------------------------------
 */
