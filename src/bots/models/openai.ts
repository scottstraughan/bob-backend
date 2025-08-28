import OpenAI from 'openai';

import { BotResponse, Bots } from '../bots';
import { generalInstructions, searchInstructions } from '../instructions';
import { Logger } from '../../log/logging';

/**
 * OpenAI Bot.
 */
export class OpenAIBot implements Bots {
  /**
   * OpenAI reference.
   * @private
   */
  private openAi: OpenAI;

  /**
   * Constructor.
   */
  constructor(
    apiToken: string = '',
    private model = 'gpt-4o-mini'
  ) {
    this.openAi = new OpenAI({
      apiKey: apiToken
    });
  }

  /**
   * @inheritdoc
   */
  async speak(
    message: string
  ): Promise<BotResponse> {
    return new Promise<BotResponse>((resolve, reject) => {
      const response = this.sendRequest(message, generalInstructions);

      response.then((result) => resolve({
        response: result.output_text
      }));

      response.catch((error) =>
        reject(error))
    });
  }

  /**
   * @inheritdoc
   */
  async search(
    message: string,
    searchResults: []
  ): Promise<BotResponse> {
    return new Promise<BotResponse>((resolve, reject) => {
      const instructions  = searchInstructions
        .replace('SEARCH_RESULTS_LENGTH', searchResults.length.toString())
        .replace('JSON_SEARCH_RESULTS', JSON.stringify(searchResults))

      const response = this.sendRequest(message, instructions);

      response.then((result) => resolve({
        response: result.output_text
      }));

      response.catch((error) =>
        reject(error))
    });
  }

  /**
   * @inheritdoc
   */
  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Send a request to OpenAI.
   * @private
   */
  private sendRequest(
    message: string,
    instructions: string
  ) {
    Logger.info(`Sending request to OpenAI using model ${this.model}.`)

    return this.openAi.responses.create({
      model: this.model,
      input: message,
      store: false,
      instructions: instructions,
    });
  }
}