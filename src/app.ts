import { Search } from './search/search';
import { Server } from './server';
import { Bots } from './bots/bots';
import { OpenAIBot } from './bots/models/openai';

const embeddingsUrl = 'https://database.saorsail.com/v1/embeddings.json';
const apiKey = process.env.OPENAI_API_TOKEN;
const port = process.env.PORT || 3001;

if (!apiKey) {
  console.error('OpenAI API key is not set!');
  process.exit(1);
}

/**
 * Add as many models as you like. If one becomes unavailable (rate limited), the server will pick the next available.
 */
export const AVAILABLE_BOTS: Bots[] = [
  new OpenAIBot(apiKey)
];

// Sanity check
if (AVAILABLE_BOTS.length == 0) {
  console.error('At least one bot must be made available, otherwise Bob has no brain!');
  process.exit(1);
}

// Start things up
(async () => {
  try {
    const search = new Search(embeddingsUrl);

    // Wait until all the embeddings have been downloaded
    await search.initialize()

    const server = new Server(search);
    server.start(port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
