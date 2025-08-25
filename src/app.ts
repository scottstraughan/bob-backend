import { Search } from './search';
import { Server } from './server';

const apiKey = process.env.OPENAI_API_TOKEN;
const embeddingsUrl = 'https://database.saorsail.com/v1/embeddings.json';
const port = process.env.PORT || 3001;

if (!apiKey) {
    console.error("OpenAI API key is not set!");
    process.exit(1);
}

Search.fetchEmbeddings(embeddingsUrl)
  .then(embeddings => {
      console.log('Embeddings loaded, starting server..');

      const server = new Server(apiKey, embeddings);
      server.start(port);
  });
