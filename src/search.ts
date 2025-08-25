import https from 'https';

/**
 * Embedding class.
 * // TODO: Make this not totally messy...
 */
export class Search {
  /**
   * Fetch embeddings from the github pages site.
   * @param url
   */
  static async fetchEmbeddings(
    url: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = "";

        // Collect chunks of data
        res.on("data", chunk => {
          data += chunk;
        });

        // On finish, try parsing JSON
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      }).on("error", reject);
    });
  }

  /**
   * Check if the query is a search request or not.
   */
  static isSearchQuery(
    input: string
  ): boolean {
    const searchKeywords = ["search", "find", "lookup", "show me", "look for"];
    return searchKeywords.some(word => input.includes(word));
  }

  /**
   * Check if the query is an install request.
   */
  static  isInstallQuery(
    input: string
  ): boolean {
    const searchKeywords = ["install", "send to"];
    return searchKeywords.some(word => input.includes(word));
  }

  /**
   * Check if the query is an download request.
   */
  static  isDownloadQuery(
    input: string
  ): boolean {
    const searchKeywords = ["download", "get apk"];
    return searchKeywords.some(word => input.includes(word));
  }
}

/**
 * Returned form the embedding layer.
 */
export type Application = {
  namespace: string,
  search: string
  embedding: []
}

/**
 * Add a score for vector search.
 */
export type ApplicationWithScore = Application & {
  score: number
}