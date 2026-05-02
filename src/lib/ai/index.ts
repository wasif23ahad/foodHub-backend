import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

// Google Gemini Setup (Free tier)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Hugging Face Setup (Free tier for embeddings)
export const hf = new HfInference(process.env.HF_API_KEY || "");

/**
 * Generates embeddings for a given text using Hugging Face's feature extraction.
 * Uses a standard model like 'sentence-transformers/all-MiniLM-L6-v2' which is fast and free.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });
    
    // HF returns an array of numbers (the embedding vector)
    return response as number[];
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Converts a number array (vector) to a Buffer for storage
 */
export function vectorToBuffer(vector: number[]): Buffer {
  return Buffer.from(new Float32Array(vector).buffer);
}

/**
 * Converts a Buffer back to a number array (vector)
 */
export function bufferToVector(buffer: Buffer): number[] {
  return Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
}

/**
 * Simple Cosine Similarity calculation
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  
  if (mA === 0 || mB === 0) return 0;
  
  return dotProduct / (mA * mB);
}
