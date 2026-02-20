import { v } from "convex/values";

export const SemanticCacheEntrySchema = v.object({
  embedding: v.array(v.float64()),
  result_ids: v.array(v.string()),
});
