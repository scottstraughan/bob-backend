# Bob Brain (Backend)

The Bob brain is a simple NodeJS/ExpressJS app that interfaces with various LLMs such as OpenAI. This service 
allows users to talk to "Bob", a friendly Bot. Bob can help search for apps, download and install apps and more!

## Overview

Bob is powered by 3 core bits of functionality.

1. Bob Brain (ExpressJS server/middlware - you are here)
2. [ngx-bob](https://github.com/scottstraughan/ngx-bob)
3. [Embedding Layer](https://github.com/scottstraughan/saorsail-popular-db/blob/main/src/embeddings/__init__.py) (generated on database updates)

## Notes

- You can host bob-brain for free on render.com (that is what I do)
- You can add multiple OneAPI API keys, Claude Keys or even Grok
- If you are providng search functionality, you probably want to create your own embedding layer. I used `all-MiniLM-L6-v2`
- I've harcoded keyword checking for understand if the query is a search request or not. This isn't foolproof, but I wanted to reduce using the API backend to do the check to keep things cheap

## License

MIT

