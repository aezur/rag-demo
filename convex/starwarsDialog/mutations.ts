import { mutation } from "../_generated/server";
import { StatusResponseSchema } from "../common/schemas";
import { DialogSchema } from "./schemas";
import { v } from "convex/values";
import { reportError } from "../common/utils";

export const insert = mutation({
  args: DialogSchema,
  returns: StatusResponseSchema,
  handler: async (ctx, args) => {
    try {
      await ctx.db.insert("starwars_dialog", args);
      return { status: "success" };
    } catch (error) {
      reportError(error);
      return { status: "error" };
    }
  },
});

export const insertMany = mutation({
  args: v.object({ dialogs: v.array(DialogSchema) }),
  returns: StatusResponseSchema,
  handler: async (ctx, args) => {
    try {
      const newIds = [];
      for (const dialog of args.dialogs) {
        const newDialogId = await ctx.db.insert("starwars_dialog", dialog);
        newIds.push(newDialogId);
      }
      return { status: "success" };
    } catch (error) {
      reportError(error);
      return { status: "error" };
    }
  },
});
