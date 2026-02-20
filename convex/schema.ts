import { defineSchema, defineTable } from "convex/server";
import { DialogSchema } from "./starwarsDialog/schemas";
import { SemanticCacheEntrySchema } from "./semanticCache/schemas";

export default defineSchema({
  starwars_dialog: defineTable(DialogSchema).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI embedding size
    filterFields: ["character"], // allow filtering by character name
  }),

  semantic_cache: defineTable(SemanticCacheEntrySchema).vectorIndex(
    "by_embedding",
    {
      vectorField: "embedding",
      dimensions: 1536,
    },
  ),
});
