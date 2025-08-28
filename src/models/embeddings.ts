/**
 * Returned form the embedding layer.
 */
export type EmbeddingResult = {
  namespace: string,
  search: string
  embedding: []
}

/**
 * Add a score for vector search.
 */
export type ScoredEmbeddingResult = EmbeddingResult & {
  score: number
}