export type ParsedDialogLine = {
  id: string;
  character: string;
  dialog: string;
};

/**
 * Parsed raw dialog data into structured format for embedding and storage in Convex.
 * Example of file format (space-separated, quoted fields):
 * "character" "dialogue"
 * "1" "THREEPIO" "Did you hear that?  They've shut down the main reactor.  We'll be destroyed for sure.  This is madness!"
 * "2" "THREEPIO" "We're doomed!"
 * "3" "THREEPIO" "There'll be no escape for the Princess this time."
 * @param rawData
 * @returns
 */
export const parseDialogData = (rawData: string, idPrefix: string) => {
  const lines = rawData.split("\n").slice(1); // Skip header line
  const parsedLines: ParsedDialogLine[] = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Skip empty lines
    // Use a regex to match three quoted fields, allowing embedded quotes in the third field
    const match = trimmed.match(/^"([^"]+)"\s+"([^"]+)"\s+"([\s\S]*)"$/);
    if (!match) {
      console.warn(
        `Skipping malformed line for prefix '${idPrefix}': '${trimmed}'`,
      );
      return;
    }
    const [, id, character, dialogue] = match;
    parsedLines.push({
      id: `${idPrefix}_${id.replace(/[^a-zA-Z0-9_\-]/g, "")}`,
      character,
      dialog: dialogue.replace(/\\"/g, '"'),
    });
  });
  return parsedLines;
};
