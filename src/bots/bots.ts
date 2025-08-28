import { ScoredEmbeddingResult } from '../models/embeddings';

/**
 * Common interface for all bots.
 */
export interface Bots {
  /**
   * Ask the bot a question.
   * @param message
   */
  speak(
    message: string
  ): Promise<BotResponse>;

  /**
   * Ask the bot to perform a search.
   * @param message
   * @param searchResults
   */
  search(
    message: string,
    searchResults: ScoredEmbeddingResult[]
  ): Promise<BotResponse>

  /**
   * If the bot is available for action or not.
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Response format from Bot.
 */
export type BotResponse = {
  response: string
}
