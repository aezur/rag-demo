import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { reportError } from "./common/utils";

const http = httpRouter();

http.route({
  path: "/ingest",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("Received request to /ingest");
    try {
      const data = await req.json();

      await ctx.runMutation(api.starwarsDialog.mutations.insertMany, {
        dialogs: data.dialogs,
      });

      return new Response("ok");
    } catch (error) {
      reportError(error);
      return new Response("error", { status: 500 });
    }
  }),
});

export default http;
