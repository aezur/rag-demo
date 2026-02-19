import { openaiPrecheck } from "./openaiPrecheckUtil";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  global.fetch = vi.fn(async (url: any, opts: any): Promise<Response> => {
    const makeResponse = (status: number, ok: boolean, statusText?: string) =>
      new Response(null, { status, statusText: statusText || '' });
    if (!opts.headers || !opts.headers["Authorization"]) {
      return makeResponse(401, false);
    }
    if (opts.headers["Authorization"].includes("fail")) {
      return makeResponse(429, false, "Rate limit or quota exceeded");
    }
    if (opts.headers["Authorization"].includes("sk-test")) {
      return makeResponse(200, true, "OK");
    }
    return makeResponse(401, false);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("openaiPrecheck", () => {
  it("returns ok for valid key", async () => {
    const result = await openaiPrecheck("sk-test");
    expect(result.ok).toBe(true);
  });
  it("returns error for missing key", async () => {
    const result = await openaiPrecheck("");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });
  it("returns error for rate limit", async () => {
    const result = await openaiPrecheck("fail");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(429);
  });
});
