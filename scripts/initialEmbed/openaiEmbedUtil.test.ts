import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchOpenAIEmbeddings } from "./openaiEmbedUtil";

beforeEach(() => {
  global.fetch = vi.fn(async (url: any, opts: any): Promise<Response> => {
    const makeResponse = (status: number, ok: boolean, jsonObj: any) =>
      new Response(JSON.stringify(jsonObj), { status });
    if (!opts.headers || !opts.headers["Authorization"]) {
      return makeResponse(401, false, { error: "Missing key" });
    }
    if (opts.body && opts.body.includes("fail")) {
      return makeResponse(429, false, { error: "Rate limit" });
    }
    return makeResponse(200, true, { data: [{ embedding: [1, 2, 3] }, { embedding: [4, 5, 6] }] });
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchOpenAIEmbeddings", () => {
  it("returns embeddings for valid input and key", async () => {
    const result = await fetchOpenAIEmbeddings(["a", "b"], "sk-test");
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });
  it("throws on missing API key", async () => {
    await expect(fetchOpenAIEmbeddings(["a"], "")).rejects.toThrow();
  });
  it("throws on rate limit", async () => {
    await expect(fetchOpenAIEmbeddings(["fail"], "sk-test")).rejects.toThrow();
  });
});
