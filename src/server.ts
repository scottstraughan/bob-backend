import OpenAI from 'openai';
import express, { Express } from 'express';
import cors from 'cors';

import { cosineSimilarity, embedSearchQuery } from './utils';
import { Application, ApplicationWithScore, Search } from './search';

/**
 * Server class.
 */
export class Server {
  public static model = "gpt-4o-mini";

  public openAi: OpenAI;

  /**
   * Constructor.
   */
  constructor(
    protected openApiToken: string,
    protected embeddings: any
  ) {
    this.openAi = new OpenAI({
      apiKey: this.openApiToken
    });
  }

  /**
   * Start the server.
   * @param port
   */
  start(
    port: any
  ): Express {
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
   * Perform a cosine similarity over vectors search.
   * @param query
   * @private
   */
  private async search(
    query: string
  ) {
    const embeddedQuery = await embedSearchQuery(query);

    let result = this.embeddings
      .map((application: Application) => ({
          ...application,
          score: cosineSimilarity(embeddedQuery, application.embedding)
        }))
      .sort((a: ApplicationWithScore, b: ApplicationWithScore) =>
        b.score - a.score);

    return result.slice(0, 5);
  }

  /**
   * Speak endpoint.
   * @param req
   * @param res
   * @private
   */
  private async speak(
    req: any,
    res: any
  ) {
    let userMessage: string = req.body['body'].toLowerCase();
    let instructions: string = `
    
    You are a helpful assistant named "Bob" and you are running on a website called "saorsail.com".
    Saorsail.com is an app store, based on the F-Droid database. The app is a PWA app, written in TypeScript using
    the Angular framework. It was created by Scott Straughan (https://strong.scot).
    
    - You should ONLY help with providing information about apps
    - Information about saorsail
    - Installing apps to devices
    - Downloading apps
    
    Avoid any off-topic questions.
    
    If a user asks where can they browse apps, create a link pointing to "/browse". `;

    console.log(`Got: ${userMessage}`);

    if (Search.isSearchQuery(userMessage)) {
      console.log("Found a search query, performing search... ");

      const searchResults = await this.search(userMessage);
      const resultsJson = JSON.stringify(searchResults);

      console.log("Found " + searchResults.length);

      instructions += `
      - The user has searched saorsail.com for an app
      - You have found ${searchResults.length} apps
      - Provide a markdown list of links
      - Each link should be in the format https://www.saorsail.com/app/NAMESPACE
      - NAMESPACE can be found as a property of each object in the following JSON object array
      - JSON: ${resultsJson}
      - Return 5 results max
      `;
    }

    const response = this.openAi.responses.create({
      model: Server.model,
      input: userMessage,
      store: false,
      instructions: instructions,
    });

    response.then((result) =>
      res.json({ 'message': result.output_text }));

    response.catch((error) =>
      res.json({ 'message': 'There was a problem, please send your message again in a few mins.' }))
  }

  private status(
    req: any,
    res: any
  ) {
    res.json({ 'status': 'available' })
  }
}