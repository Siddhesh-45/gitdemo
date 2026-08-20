/**
 * MongoDB Database Connection
 * Singleton pattern for database connection management
 * 
 * Why singleton?
 * - Prevents connection exhaustion
 * - Reuses connection pool across requests
 * - Handles connection lifecycle properly
 */

import { MongoClient, Db, MongoClientOptions } from "mongodb";

// Lazy-load env vars to allow dotenv config to run first in scripts
function getMongoConfig() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB || "rag_db";

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  return { MONGODB_URI, MONGODB_DB };
}

interface CachedConnection {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

declare global {
  var _mongoCache: CachedConnection | undefined;
}

const cached: CachedConnection = global._mongoCache || {
  client: null,
  db: null,
  promise: null,
};

if (!global._mongoCache) {
  global._mongoCache = cached;
}

const clientOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
};

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const { MONGODB_URI, MONGODB_DB } = getMongoConfig();
  
  if (cached.client && cached.db) {
    // Verify connection is still alive
    try {
      await cached.db.admin().ping();
      return { client: cached.client, db: cached.db };
    } catch {
      // Connection dead, will create new one
      cached.client = null;
      cached.db = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const client = new MongoClient(MONGODB_URI, clientOptions);
      await client.connect();
      const db = client.db(MONGODB_DB);
      
      // Verify connection
      await db.admin().ping();
      console.log(`✅ Connected to MongoDB: ${MONGODB_DB}`);
      
      return { client, db };
    })();
  }

  const { client, db } = await cached.promise;
  cached.client = client;
  cached.db = db;
  
  return { client, db };
}

export async function getDB(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getClient(): Promise<MongoClient> {
  const { client } = await connectToDatabase();
  return client;
}

export async function closeConnection(): Promise<void> {
  if (cached.client) {
    await cached.client.close();
    cached.client = null;
    cached.db = null;
    cached.promise = null;
    console.log("🔌 MongoDB connection closed");
  }
}

// Collection names
export const COLLECTIONS = {
  DOCUMENT_CHUNKS: "document_chunks",
  CONVERSATIONS: "conversations",
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];