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
    return this.sendRequest(message, generalInstructions);
  }

  /**
   * @inheritdoc
   */
  async search(
    message: string,
    searchResults: []
  ): Promise<BotResponse> {
    const instructions = searchInstructions
      .replace('SEARCH_RESULTS_LENGTH', searchResults.length.toString())
      .replace('JSON_SEARCH_RESULTS', JSON.stringify(searchResults))

    return  this.sendRequest(message, instructions);
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
  ): Promise<BotResponse> {
    Logger.info(`Sending request to OpenAI using model ${this.model}.`)

    return new Promise((resolve) => {
      const request = this.openAi.responses.create({
        model: this.model,
        input: message,
        store: false,
        instructions: instructions,
      });

      request.then((result) => {
        Logger.info(`OpenAI response: ${result.output_text}`);

        resolve({
          response: result.output_text,
        })
      });

      request.catch((error) => {
        Logger.error(error);

        resolve({
          response: 'Bob is having a meltdown right now.... Please try again later.'
        })
      })
    });
  }
}