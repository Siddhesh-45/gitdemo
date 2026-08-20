import { ObjectId } from "mongodb";
import { getDB, COLLECTIONS } from "@/lib/db";

export interface DocumentChunk {
  _id?: ObjectId;

  content: string;

  embedding?: number[];

  metadata: {
    source: string;
    title?: string;
    page?: number;
    chunkIndex?: number;
  };

  createdAt: Date;
}

/**
 * Insert a single document chunk
 */
export async function createDocumentChunk(
  chunk: Omit<DocumentChunk, "_id">
) {
  const db = await getDB();

  const result = await db
    .collection<DocumentChunk>(COLLECTIONS.DOCUMENT_CHUNKS)
    .insertOne(chunk);

  return {
    ...chunk,
    _id: result.insertedId,
  };
}

/**
 * Insert multiple chunks
 */
export async function createDocumentChunks(
  chunks: Omit<DocumentChunk, "_id">[]
) {
  const db = await getDB();

  if (chunks.length === 0) {
    return [];
  }

  const result = await db
    .collection<DocumentChunk>(COLLECTIONS.DOCUMENT_CHUNKS)
    .insertMany(chunks);

  return chunks.map((chunk, index) => ({
    ...chunk,
    _id: result.insertedIds[index],
  }));
}