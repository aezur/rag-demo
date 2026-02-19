# Star Wars RAG-stack Demo

## Getting started

This repository includes the Star Wars dialog lines (located at `scripts/initialEmbed/data/*.txt`).

To generate the embeddings, ensure a valid `OPENAI_API_KEY` is set in your environment (e.g., `export OPENAI_API_KEY=sk-...` on Unix, or `set OPENAI_API_KEY=sk-...` on Windows).

Run:

- `npx tsx ./scripts/initialEmbed/parseAndSaveDialog.ts`

Followed By:

- `npx tsx ./scripts/initialEmbed/embedDialog.ts <path-to-dialog-lines>.json`

**Note:** Dataset is <16k tokens and costs less than 1 cent.
