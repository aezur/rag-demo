import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * CLI: node uploadEmbeddings <path-to-json> <url>
 * Example: node uploadEmbeddings data/dialogs.json http://localhost:3000/api/upload
 */
export async function main(
  inputFile?: string,
  url?: string,
  opts?: { testMode?: boolean },
) {
  console.log(
    "Starting uploadEmbeddings with inputFile:",
    inputFile,
    "url:",
    url,
  );
  // CLI usage check
  if (!inputFile || !url) {
    console.error("Usage: node uploadEmbeddings <path-to-json> <url>");
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }

  // Resolve input path
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const inputPath = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(scriptDir, inputFile);
  console.log("Input file:", inputFile);
  console.log("Resolved input path:", inputPath);

  // Load and validate JSON
  let dialogs;
  try {
    dialogs = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  } catch (err) {
    console.error("Failed to read or parse input file:", inputPath, err);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }
  if (!Array.isArray(dialogs)) {
    console.error("Input file is not a JSON array:", inputPath);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }
  // Validate shape
  const valid = dialogs.every(
    (d) =>
      typeof d.id === "string" &&
      typeof d.character === "string" &&
      typeof d.dialog === "string" &&
      Array.isArray(d.embedding),
  );
  if (!valid) {
    console.error(
      "Input JSON does not match required shape: [{ id, character, dialog, embedding }]",
      inputPath,
    );
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }
  console.log(`Loaded ${dialogs.length} dialogs. Sending to ${url}...`);

  const cleanedDialogs = dialogs.map((d) => ({
    id: d.id,
    character: d.character,
    dialog: d.dialog,
    embedding: d.embedding,
  }));

  // POST to URL using native fetch
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dialogs: cleanedDialogs }),
    });
    const text = await response.text();
    if (!response.ok) {
      console.error(
        `POST failed: ${response.status} ${response.statusText}\n${text}`,
      );
      if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
        throw new Error("process.exit called");
      process.exit(1);
    }
    console.log(`POST succeeded: ${response.status} ${response.statusText}`);
    console.log("Response:", text);
  } catch (err) {
    console.error("POST request failed:", err);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }
}

// ESM entry-point check
console.log("Starting uploadEmbeddings script...");
const inputArg = process.argv[2];
const urlArg = process.argv[3];
main(inputArg, urlArg).catch((err) => {
  console.error("Fatal error:", err);
  if (process.env.NODE_ENV !== "test") process.exit(1);
});
