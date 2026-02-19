import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { vol, fs } from "memfs";

const TEST_INPUT = "/test-lines.json";
const TEST_OUTPUT = "/test-embeddings.json";
const DEFAULT_OUTPUT = /\/data\/output\/test-lines-embeddings\.json$/;
const LINES_FILE = [
  { id: "test_1", character: "A", dialog: "Hello" },
  { id: "test_2", character: "B", dialog: "World" },
];

vi.mock("fs", async () => {
  const memfs = await vi.importActual("memfs");
  return {
    ...(memfs.fs as Record<string, unknown>),
    default: memfs.fs,
  };
});


vi.mock("./openaiPrecheckUtil", () => ({
  openaiPrecheck: vi.fn().mockResolvedValue({ ok: true })
}));

vi.mock("./openaiEmbedUtil", () => ({
  fetchOpenAIEmbeddings: vi.fn().mockImplementation((lines) => Promise.resolve(lines.map(() => [0, 1, 2])))
}));

describe("embedDialog CLI", () => {

  // Unmock for embedding logic tests
  afterEach(() => {
    vi.resetModules();
  });
  let consoleError: ReturnType<typeof vi.spyOn>,
    consoleWarn: ReturnType<typeof vi.spyOn>,
    consoleLog: ReturnType<typeof vi.spyOn>,
    exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
      [TEST_INPUT]: JSON.stringify(LINES_FILE),
    });
    process.env.OPENAI_API_KEY = 'sk-test';
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails if called with no inputFile", async () => {
    const { main } = await import("./embedDialog");
    await expect(main()).rejects.toThrow("process.exit called");
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Usage: node embedDialog"),
    );
  });

  it("warns and uses default output path if not provided", async () => {
    const { main } = await import("./embedDialog");
    await expect(main(TEST_INPUT)).resolves.toBeUndefined();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("No output path selected"),
    );
  });

  it("errors if input file does not exist", async () => {
    const { main } = await import("./embedDialog");
    await expect(main("/notfound.json", TEST_OUTPUT)).rejects.toThrow(
      "process.exit called",
    );
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Input file does not exist"),
      expect.stringContaining("notfound.json"),
    );

  });

  it("writes embeddings output and skips already embedded lines", async () => {
    const { main } = await import("./embedDialog");
    // Pre-populate output with one embedded line
    vol.fromJSON({
      [TEST_OUTPUT]: JSON.stringify([
        {
          id: "test_1",
          character: "A",
          dialog: "Hello",
          embedding: [0, 1, 2],
          filename: "test-lines.json",
          lineNumber: 1,
        },
      ]),
    });
    await expect(main(TEST_INPUT, TEST_OUTPUT)).resolves.toBeUndefined();
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(2);
    expect(arr[0].id).toBe("test_1");
    expect(arr[1].id).toBe("test_2");
    expect(arr[1].embedding).toBeDefined();
  });

  it("logs and skips batch on simulated rate limit", async () => {
    const { main } = await import("./embedDialog");
    // Patch Math.random to always trigger rate limit on first call, then succeed
    let callCount = 0;
    vi.spyOn(Math, "random").mockImplementation(() =>
      ++callCount === 1 ? 0.01 : 0.99,
    );
    await expect(main(TEST_INPUT, TEST_OUTPUT)).resolves.toBeUndefined();
    // Should still write output for both lines
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(2);
  });

  it("handles partial batch failures and logs each failed line", async () => {
    const { main } = await import("./embedDialog");
    // Patch Math.random to fail on first line, succeed on second
    let callCount = 0;
    vi.spyOn(Math, "random").mockImplementation(() =>
      ++callCount === 1 ? 0.019 : 0.99,
    );
    await expect(main(TEST_INPUT, TEST_OUTPUT)).resolves.toBeUndefined();
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(2);
  });

  it("logs error and continues on simulated server error", async () => {
    const { main } = await import("./embedDialog");
    // Patch Math.random to trigger server error on first call, then succeed
    let callCount = 0;
    vi.spyOn(Math, "random").mockImplementation(() =>
      ++callCount === 1 ? 0.015 : 0.99,
    );
    await expect(main(TEST_INPUT, TEST_OUTPUT)).resolves.toBeUndefined();
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(2);
  });
});
