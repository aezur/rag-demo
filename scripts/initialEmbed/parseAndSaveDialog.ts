import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * CLI: node parseAndSaveDialog <relative-path-to-dialog-file>
 * Example: node parseAndSaveDialog data/SW_EpisodeIV.txt
 */
export async function main(inputFile?: string, outputPath?: string) {
  // Bail if no input file provided
  if (!inputFile) {
    console.error(
      "Usage: node parseAndSaveDialog <relative-path-to-dialog-file> [output-file]",
    );
    process.exit(1);
  }

  if (!outputPath) {
    console.warn(
      "No output path selected. Using default output path based on input file name.",
    );
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const fileName = path.basename(inputFile, path.extname(inputFile));
  const idPrefix = fileName;

  // Accept both absolute and relative paths for input
  const inputPath = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(scriptDir, inputFile);
  console.log("Input file:", inputFile);

  console.log("Resolved input path:", inputPath);
  if (!fs.existsSync(inputPath)) {
    console.error("Input file does not exist:", inputPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(inputPath, "utf8");
  console.log("Raw data length:", rawData.length);

  // If file is empty, warn and exit before parsing
  if (!rawData.trim()) {
    console.warn("Input file is empty or contains no valid dialog lines.");
    process.exit(1);
  }

  const { parseDialogData } = await import("./parseDialogData");
  const parsed = parseDialogData(rawData, idPrefix);
  console.log("Parsed lines count:", parsed.length);

  if (parsed.length === 0) {
    console.warn("Input file is empty or contains no valid dialog lines.");
    process.exit(1);
  }

  // If output file is not provided, save to ./data/output/{input-file-name}-lines.json

  const outPath =
    outputPath ??
    path.join(scriptDir, "data", "output", `${fileName}-lines.json`);

  // Ensure output directory exists
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    try {
      fs.mkdirSync(outDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create output directory:", outDir, err);
      process.exit(1);
    }
  }
  try {
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write output file:", outPath, err);
    process.exit(1);
  }
  console.log(`Parsed dialog saved to ${outPath}`);
}

// ESM-compatible entry-point check
if (typeof process !== "undefined" && typeof process.argv !== "undefined") {
  // import.meta.url is a file:// URL, process.argv[1] is a path
  import("url").then(({ fileURLToPath }) => {
    const thisFile = fileURLToPath(import.meta.url);
    if (process.argv[1] === thisFile) {
      main();
    }
  });
}
