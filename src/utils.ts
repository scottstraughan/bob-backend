import { pipeline, Tensor } from '@xenova/transformers';

/**
 * Calculate the cosine similarity between two vectors.
 */
export function cosineSimilarity(
  a: any,
  b: any
) {
  let dot = 0.0, normA = 0.0, normB = 0.0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Embed a search query.
 */
export async function embedSearchQuery(
  text: string
) {
  text = text.toLowerCase();

  const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const result: Tensor = await embed(text);

  // Convert Tensor to array
  const arr = result.data; // Float32Array
  const [batch, tokens, embeddingSize]: any = result.dims;

  // Pool token embeddings by averaging across tokens
  const sentenceEmbedding: number[] = [];
  for (let i = 0; i < embeddingSize; i++) {
    let sum = 0;

    for (let j = 0; j < tokens; j++) {
      sum += arr[j * embeddingSize + i]; // flatten indexing
    }

    sentenceEmbedding.push(sum / tokens);
  }

  return sentenceEmbedding;
}