import mongoose from "mongoose";
import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DB_NAME || "donation";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Mongoose connection (for models)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
  var mongoClient: MongoClient | undefined;
  var mongoDb: Db | undefined;
}

const mongooseCached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = mongooseCached;
}

// Native MongoDB client (for RAG operations)
let mongoClient: MongoClient | null = global.mongoClient || null;
let mongoDb: Db | null = global.mongoDb || null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongooseCached.conn) {
    return mongooseCached.conn;
  }

  if (!mongooseCached.promise) {
    mongooseCached.promise = mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    });
  }

  try {
    mongooseCached.conn = await mongooseCached.promise;
    console.log(`Connected to MongoDB successfully: ${mongooseCached.conn.connection.name}`);
  } catch (error) {
    mongooseCached.promise = null;
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }

  return mongooseCached.conn;
};

// Get native MongoDB database instance for RAG operations
export const getDB = async (): Promise<Db> => {
  if (mongoDb) {
    return mongoDb;
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    global.mongoClient = mongoClient;
  }

  mongoDb = mongoClient.db(DB_NAME);
  global.mongoDb = mongoDb;
  console.log(`Native MongoDB connected: ${mongoDb.databaseName}`);
  return mongoDb;
};

export const closeDB = async (): Promise<void> => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    global.mongoClient = undefined;
    global.mongoDb = undefined;
  }
};

export default connectDB;