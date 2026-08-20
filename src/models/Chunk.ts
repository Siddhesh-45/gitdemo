import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChunk extends Document {
  text: string;
  embedding: number[];
  metadata: {
    source?: string;
    title?: string;
    url?: string;
  };
}

const ChunkSchema = new Schema<IChunk>(
  {
    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    metadata: {
      source: String,
      title: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

const Chunk: Model<IChunk> =
  mongoose.models.Chunk ||
  mongoose.model<IChunk>("Chunk", ChunkSchema);

export default Chunk;