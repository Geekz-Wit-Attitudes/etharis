import type { SearchAuditSchema } from "./audit-validation";

import type z from "zod";

export type SearchAuditQuery = z.infer<typeof SearchAuditSchema>;
