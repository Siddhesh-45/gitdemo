import {
  createDocumentChunks,
} from "@/models/DocumentChunk";

import { chunkText } from "./chunkText";

interface IngestDocumentOptions {
  text: string;
  source: string;
  title?: string;
  page?: number;
}

export async function ingestDocument({
  text,
  source,
  title,
  page,
}: IngestDocumentOptions) {
  // 1. Create text chunks
  const chunks = chunkText(text, 500, 100);

  // 2. Convert chunks into database objects
  const documents = chunks.map((chunk) => ({
    content: chunk.content,

    metadata: {
      source,
      title,
      page,
      chunkIndex: chunk.chunkIndex,
    },

    createdAt: new Date(),
  }));

  // 3. Store chunks in MongoDB
  const insertedChunks =
    await createDocumentChunks(documents);

  return {
    count: insertedChunks.length,
    chunks: insertedChunks,
  };
}