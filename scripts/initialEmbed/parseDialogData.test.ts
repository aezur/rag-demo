import { describe, it, expect } from "vitest";
import { parseDialogData } from "./parseDialogData";

const HEADER = '"character" "dialogue"';
const EMPTY = "";
const DIALOG_1 =
  '"1" "THREEPIO" "Did you hear that?  They\'ve shut down the main reactor."';
const DIALOG_2 = '"2" "THREEPIO" "We\'re doomed!"';
const DIALOG_3 =
  '"3" "THREEPIO" "There\'ll be no escape for the Princess this time."';
const EMBEDDED_1 = '"190" "LEIA" "He means \"You\'re welcome.\""';
const EMBEDDED_2 =
  '"284" "THREEPIO" "\"Exciting\" is hardly the word I would use."';
const MALFORMED = "malformed line here";
const DIALOG_4 = '"1" "THREEPIO" "Valid dialog"';
const DIALOG_5 = '"2" "THREEPIO" "Another valid dialog"';

const validRawData = [HEADER, DIALOG_1, DIALOG_2, DIALOG_3].join("\n");
const embeddedQuotesData = [HEADER, EMBEDDED_1, EMBEDDED_2].join("\n");
const malformedRawData = [HEADER, DIALOG_4, MALFORMED, DIALOG_5].join("\n");

describe("parseDialogData", () => {
  it("skips header and empty lines", () => {
    const headerAndEmpty = [
      HEADER,
      EMPTY,
      '"1" "THREEPIO" "Hello!"',
      EMPTY,
      '"2" "LEIA" "General Kenobi!"',
    ].join("\n");
    const result = parseDialogData(headerAndEmpty, "head");
    expect(result).toEqual([
      {
        id: "head_1",
        character: "THREEPIO",
        dialog: "Hello!",
      },
      {
        id: "head_2",
        character: "LEIA",
        dialog: "General Kenobi!",
      },
    ]);
  });
  it("parses lines with embedded quotes", () => {
    const result = parseDialogData(embeddedQuotesData, "edge");
    expect(result).toEqual([
      {
        id: "edge_190",
        character: "LEIA",
        dialog: 'He means "You\'re welcome."',
      },
      {
        id: "edge_284",
        character: "THREEPIO",
        dialog: '"Exciting" is hardly the word I would use.',
      },
    ]);
  });
  it("parses valid dialog lines and prefixes IDs", () => {
    const result = parseDialogData(validRawData, "test");
    expect(result).toEqual([
      {
        id: "test_1",
        character: "THREEPIO",
        dialog: "Did you hear that?  They've shut down the main reactor.",
      },
      {
        id: "test_2",
        character: "THREEPIO",
        dialog: "We're doomed!",
      },
      {
        id: "test_3",
        character: "THREEPIO",
        dialog: "There'll be no escape for the Princess this time.",
      },
    ]);
  });

  it("skips malformed lines", () => {
    const result = parseDialogData(malformedRawData, "skip");
    expect(result).toEqual([
      {
        id: "skip_1",
        character: "THREEPIO",
        dialog: "Valid dialog",
      },
      {
        id: "skip_2",
        character: "THREEPIO",
        dialog: "Another valid dialog",
      },
    ]);
  });

  it("returns empty array for empty input", () => {
    const result = parseDialogData("", "prefix");
    expect(result).toEqual([]);
  });

  it("returns empty array for header-only input", () => {
    const result1 = parseDialogData(HEADER, "prefix");
    const result2 = parseDialogData(HEADER + "\n", "prefix");
    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
  });

  it("returns empty array when all lines are malformed", () => {
    const malformedOnly = [MALFORMED, MALFORMED, MALFORMED].join("\n");
    const result = parseDialogData(malformedOnly, "prefix");
    expect(result).toEqual([]);
  });
});
