import z from "zod";

export const SearchAuditSchema = z.object({
  table_name: z.string().optional(),
  record_id: z.string().optional(),
  user_id: z.string().optional(),
  action: z.string().optional(),
  date_from: z.iso.datetime().optional(),
  date_to: z.iso.datetime().optional(),
  limit: z.coerce.number().max(500).optional(),
});
