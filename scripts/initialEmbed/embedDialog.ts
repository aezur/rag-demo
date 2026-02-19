import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * CLI: node embedDialog <relative-path-to-lines-json> [output-file]
 * Example: node embedDialog data/output/SW_EpisodeIV-lines.json
 */
export async function main(
  inputFile?: string,
  outputPath?: string,
  opts?: { testMode?: boolean },
) {
  // Bail if no input file provided
  if (!inputFile) {
    console.error(
      "Usage: node embedDialog <relative-path-to-lines-json> [output-file]",
    );
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }

  // Warn if no output path provided
  if (!outputPath) {
    console.warn(
      "No output path selected. Using default output path based on input file name.",
    );
  }

  // Pre-check OpenAI API key and quota
  const apiKey = process.env.OPENAI_API_KEY as string;
  const { openaiPrecheck } = await import("./openaiPrecheckUtil.js");
  const precheck = await openaiPrecheck(apiKey);
  if (!precheck.ok) {
    console.error(
      `OpenAI pre-check failed: ${precheck.message} (status ${precheck.status})`,
    );
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }
  console.log(`OpenAI pre-check passed: ${precheck.message}`);
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const fileName = path.basename(inputFile, path.extname(inputFile));

  // Accept both absolute and relative paths for input
  const inputPath = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(scriptDir, inputFile);
  console.log("Input file:", inputFile);
  console.log("Resolved input path:", inputPath);
  if (!fs.existsSync(inputPath)) {
    console.error("Input file does not exist:", inputPath);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }

  // Output file: ./data/output/{input-file-name}-embeddings.json
  const outPath =
    outputPath ??
    path.join(scriptDir, "data", "output", `${fileName}-embeddings.json`);

  // Ensure output directory exists
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    try {
      fs.mkdirSync(outDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create output directory:", outDir, err);
      if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
        throw new Error("process.exit called");
      process.exit(1);
    }
  }

  // Load input lines
  let inputLines;
  try {
    inputLines = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  } catch (err) {
    console.error("Failed to read or parse input file:", inputPath, err);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }
  if (!Array.isArray(inputLines)) {
    console.error("Input file is not a JSON array:", inputPath);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }

  // Load existing embeddings if present
  let existingEmbeddings = [];
  if (fs.existsSync(outPath)) {
    try {
      existingEmbeddings = JSON.parse(fs.readFileSync(outPath, "utf8"));
    } catch (err) {
      console.error("Failed to read or parse output file:", outPath, err);
      if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
        throw new Error("process.exit called");
      process.exit(1);
    }
  }
  const embeddedIds = new Set(existingEmbeddings.map((e: any) => e.id));
  const toEmbed = inputLines
    .map((line, idx) => ({
      ...line,
      filename: path.basename(inputPath),
      lineNumber: idx + 1,
    }))
    .filter((line) => !embeddedIds.has(line.id));

  console.log(`Loaded ${inputLines.length} lines, ${toEmbed.length} to embed.`);

  // Batch processing (100 at a time)
  const BATCH_SIZE = 100;
  async function embedBatch(batch: any[], batchIdx: number) {
    let retries = 0;
    const maxRetries = 5;
    let backoff = 1000;
    while (retries <= maxRetries) {
      try {
        // Real OpenAI API call
        const apiKey = process.env.OPENAI_API_KEY as string;
        if (!apiKey)
          throw { code: 401, message: "Missing OPENAI_API_KEY env var" };
        const { fetchOpenAIEmbeddings } = await import("./openaiEmbedUtil.js");
        const texts = batch.map(
          (line) => line.text || line.dialog || line.content || "",
        );
        const embeddings = await fetchOpenAIEmbeddings(texts, apiKey);
        if (!Array.isArray(embeddings) || embeddings.length !== batch.length) {
          throw { code: 500, message: "Embedding count mismatch" };
        }
        return batch.map((line, i) => ({
          ...line,
          embedding: embeddings[i],
        }));
      } catch (err) {
        const errCode = (err && (err as any).code) || "unknown";
        console.error(
          `Error embedding batch ${batchIdx + 1} (attempt ${retries + 1}):`,
          errCode,
          err,
        );
        if (
          err &&
          (err as any).code &&
          ((err as any).code === 429 || (err as any).code === "rate_limit")
        ) {
          console.warn(
            `Rate limit hit on batch ${batchIdx + 1}, retrying in ${backoff}ms`,
          );
          await new Promise((res) => setTimeout(res, backoff));
          backoff *= 2;
          retries++;
        } else {
          throw err;
        }
      }
    }
    throw new Error(
      `Failed to embed batch ${batchIdx + 1} after ${maxRetries} retries`,
    );
  }

  let allEmbeddings = [...existingEmbeddings];
  for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
    const batch = toEmbed.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${i / BATCH_SIZE + 1}: lines ${i + 1}-${i + batch.length}`,
    );
    try {
      const embedded = await embedBatch(batch, i / BATCH_SIZE);
      allEmbeddings.push(...embedded);
    } catch (err) {
      // Log error for this batch, skip batch
      batch.forEach((line) => {
        console.error(`Failed to embed line:`, {
          filename: line.filename,
          lineNumber: line.lineNumber,
          character: line.character,
          id: line.id,
          error: err,
        });
      });
    }
  }

  // Write output
  try {
    fs.writeFileSync(outPath, JSON.stringify(allEmbeddings, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write output file:", outPath, err);
    if ((opts && opts.testMode) || process.env.NODE_ENV === "test")
      throw new Error("process.exit called");
    process.exit(1);
  }

  console.log(`Embedding output saved to ${outPath}`);
}

// ESM-compatible entry-point check: only run when executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url === new URL(process.argv[1], 'file://').href;

if (isMainModule) {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3];
  main(inputArg, outputArg).catch((err) => {
    console.error("Fatal error:", err);
    if (process.env.NODE_ENV !== "test") process.exit(1);
  });
}
