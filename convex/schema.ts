import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // Dialog data table: stores Star Wars dialog lines with embeddings and character info
  dialog: defineTable({
    id: v.string(), // original line id from data
    character: v.string(),
    dialog: v.string(),
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI embedding size
    filterFields: ["character"],
  }),

  // Semantic cache table: stores cached queries and their embeddings/results
  semantic_cache: defineTable({
    query: v.string(),
    embedding: v.array(v.float64()),
    result_ids: v.array(v.string()), // ids of dialog lines returned for this query
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
  }),
});
