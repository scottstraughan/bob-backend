import cors from 'cors';

import express, { Express } from 'express';
import { Logger } from './log/logging';
import { Search } from './search/search';
import { AVAILABLE_BOTS } from './app';

/**
 * Express Server
 */
export class Server {
  /**
   * Constructor.
   */
  constructor(
    protected search: Search
  ) { }

  /**
   * Start the server.
   * @param port
   */
  start(
    port: any
  ): Express {
    Logger.info(`Starting ExpressJS server...`);

    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.post('/speak', (req, res) => this.speak(req, res));
    app.get('/status', (req, res) => this.status(req, res));

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    return app
  }

  /**
   * Speak endpoint, available at /speak.
   * @private
   */
  private async speak(
    req: any,
    res: any
  ) {
    Logger.info(`Speak request received.`);

    const bot = Server.getNextAvailableBot();

    if (!bot) {
      res.json({ 'message': 'There was a problem, please send your message again in a few mins.' });
      return ;
    }

    if (req.body == undefined) {
      res.json({ 'message': 'You must provide a valid body to this endpoint.' });
      return ;
    }

    const requestMessage: SpeakRequest = req.body;

    try {
      // Verify the user is sane
      Server.verifySpeakRequest(requestMessage);
    } catch (e) {
      res.json({ 'message': 'There was a really strange issue! Try again later, if you like.' });
      return ;
    }

    const response = {
      body: 'Not really much to say, is there?'
    };

    if (Search.isSearchQuery(requestMessage.body)) {
      // Handle specific speak requests
      const searchResponse = await bot.search(
        requestMessage.body,
        await this.search.search(requestMessage.body));

      response.body = searchResponse.response;
    } else {
      // Handle generic questions
      const speakResponse = await bot.speak(requestMessage.body);
      response.body = speakResponse.response;
    }

    res.json(response);
  }

  /**
   * Verify the incoming request has the needed properties.
   */
  static verifySpeakRequest(
    req: object
  ) {
    if (!('body' in req)) {
      throw new Error('Missing body in request.');
    }
  }

  /**
   * Status endpoint, available at /status.
   * @private
   */
  private status(
    req: any,
    res: any
  ) {
    Logger.info(`Status request received.`);
    res.json({ 'status': Server.getNextAvailableBot() !== undefined ? 'available' : 'offline' })
  }

  /**
   * Get the next available bot to talk to.
   * @private
   */
  static getNextAvailableBot() {
    const availableBots = AVAILABLE_BOTS.filter(bot =>
      bot.isAvailable());

    if (availableBots.length == 0) {
      throw new Error(`No bots are available.`);
    }

    return availableBots[0];
  }
}

export type SpeakRequest = {
  body: string
  history?: SpeakRequest[]
}