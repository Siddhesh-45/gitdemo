export interface TextChunk {
  content: string;
  chunkIndex: number;
}

/**
 * Splits text into overlapping chunks.
 *
 * Example:
 *
 * chunkSize = 500
 * overlap = 100
 *
 * Chunk 1: characters 0 - 500
 * Chunk 2: characters 400 - 900
 * Chunk 3: characters 800 - 1300
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 100
): TextChunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  const chunks: TextChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + chunkSize,
      cleanedText.length
    );

    const content = cleanedText
      .slice(start, end)
      .trim();

    if (content.length > 0) {
      chunks.push({
        content,
        chunkIndex,
      });

      chunkIndex++;
    }

    if (end >= cleanedText.length) {
      break;
    }

    start += chunkSize - overlap;
  }

  return chunks;
}