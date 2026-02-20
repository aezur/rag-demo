import { v } from "convex/values";

export const DialogSchema = v.object({
  id: v.string(), // original line id from data
  character: v.string(),
  dialog: v.string(),
  embedding: v.array(v.float64()),
});
