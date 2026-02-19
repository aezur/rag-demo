import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { vol, fs } from "memfs";

const TEST_INPUT = "/test-dialog.txt";
const TEST_OUTPUT = "/test-output.json";
const DEFAULT_OUTPUT = /\/data\/output\/test-dialog-lines\.json$/;
const EMPTY_FILE = "";
const VALID_FILE = '"character" "dialogue"\n"1" "A" "Hello"\n"2" "B" "World"';
const MALFORMED_FILE =
  '"character" "dialogue"\nmalformed line\n"1" "A" "Hello"';
const MIXED_FILE =
  '"character" "dialogue"\nmalformed line\n"1" "A" "Hello"\n"2" "B" "World"';

// Mock parseDialogData for simplicity
const parseDialogData = vi.fn((raw, idPrefix) => {
  if (raw === EMPTY_FILE) return [];
  if (raw === VALID_FILE)
    return [
      { id: `${idPrefix}_1`, character: "A", dialog: "Hello" },
      { id: `${idPrefix}_2`, character: "B", dialog: "World" },
    ];
  if (raw === MALFORMED_FILE)
    return [{ id: `${idPrefix}_1`, character: "A", dialog: "Hello" }];
  if (raw === MIXED_FILE)
    return [
      { id: `${idPrefix}_1`, character: "A", dialog: "Hello" },
      { id: `${idPrefix}_2`, character: "B", dialog: "World" },
    ];
  return [{ id: "mock_1", character: "MOCK", dialog: "Hello!" }];
});

vi.mock("./parseDialogData", () => ({ parseDialogData }));
vi.mock("fs", async () => {
  const memfs = await vi.importActual("memfs");
  return {
    ...(memfs.fs as Record<string, unknown>),
    default: memfs.fs,
  };
});

import { main } from "./parseAndSaveDialog";

describe("parseAndSaveDialog", () => {
  let consoleError: ReturnType<typeof vi.spyOn>,
    consoleWarn: ReturnType<typeof vi.spyOn>,
    consoleLog: ReturnType<typeof vi.spyOn>,
    exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
      [TEST_INPUT]: VALID_FILE,
      "/empty.txt": EMPTY_FILE,
      "/malformed.txt": MALFORMED_FILE,
      "/mixed.txt": MIXED_FILE,
    });
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
    await expect(main()).rejects.toThrow("process.exit called");
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Usage: node parseAndSaveDialog"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("saves output to provided outputPath", async () => {
    await expect(main(TEST_INPUT, TEST_OUTPUT)).resolves.toBeUndefined();
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(2);
  });

  it("saves output to default path if no outputPath", async () => {
    await expect(main(TEST_INPUT)).resolves.toBeUndefined();
    const files = vol.toJSON();
    const outFile = Object.keys(files).find((f) => DEFAULT_OUTPUT.test(f));
    expect(outFile).toBeTruthy();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("No output path selected"),
    );
  });

  it("warns and exits on empty file", async () => {
    await expect(main("/empty.txt", TEST_OUTPUT)).rejects.toThrow(
      "process.exit called",
    );
    expect(consoleWarn).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("malformed data is excluded from output", async () => {
    await expect(main("/malformed.txt", TEST_OUTPUT)).resolves.toBeUndefined();
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(1);
  });

  it("mix of malformed and valid yields output line count equal to valid lines", async () => {
    await expect(main("/mixed.txt", TEST_OUTPUT)).resolves.toBeUndefined();
    const written = fs.readFileSync(TEST_OUTPUT, "utf8") as string;
    const arr = JSON.parse(written);
    expect(arr.length).toBe(2);
  });
});
