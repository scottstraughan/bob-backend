import https from 'https';

import { EmbeddingResult, ScoredEmbeddingResult } from '../models/embeddings';
import { pipeline, Tensor } from '@xenova/transformers';
import { Logger } from '../log/logging';

/**
 * Embedding class.
 */
export class Search {
  /**
   * Embeddings, pulled from URL.
   * @private
   */
  private embeddings: EmbeddingResult[] = [];

  /**
   * Constructor.
   */
  constructor(
    private embeddingDownloadUrl: string,
    private embeddingModel = 'Xenova/all-MiniLM-L6-v2'
  ) { }

  /**
   * Fetch embeddings from the GitHub pages site.
   */
  async initialize(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      Logger.info(`Downloading search embeddings from ${this.embeddingDownloadUrl}.`);

      https.get(this.embeddingDownloadUrl, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            Logger.info(`Download completed.`);

            this.embeddings = JSON.parse(data);
            resolve();
          } catch (err) {
            Logger.error(`Download errored.`);
            reject(err);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Search
   * @param query
   */
  async search(
    query: string
  ): Promise<ScoredEmbeddingResult[]> {
    const embeddedQuery = await this.embedSearchQuery(query);

    const result = this.embeddings
      .map((application: EmbeddingResult) => ({
        ...application,
        score: Search.cosineSimilarity(embeddedQuery, application.embedding)
      }))
      .sort((a: ScoredEmbeddingResult, b: ScoredEmbeddingResult) =>
        b.score - a.score);

    return result.slice(0, 5);
  }

  /**
   * Calculate the cosine similarity between two vectors.
   */
  static cosineSimilarity(
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
  async embedSearchQuery(
    text: string
  ) {
    text = text.toLowerCase();

    const embed = await pipeline('feature-extraction', this.embeddingModel);
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

  /**
   * Check if the query is a search request or not.
   */
  static isSearchQuery(
    input: string
  ): boolean {
    return ['search', 'find', 'lookup', 'show me', 'look for']
      .some(word => input.includes(word));
  }
}