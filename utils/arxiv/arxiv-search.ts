import { parseStringPromise } from "xml2js";

const FETCH_CONFIG = {
  TIMEOUT: 15000,
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 1000,
  MAX_BACKOFF: 10000,
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/xml',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'
  }
} as const;

// Add interface for fetch options
interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

function fetchWithTimeout(url: string, options: FetchOptions = {}, timeout = FETCH_CONFIG.TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      ...FETCH_CONFIG.HEADERS,
      ...(options.headers || {}) // Safely spread headers with fallback
    }
  }).finally(() => clearTimeout(timeoutId));
}

async function fetchWithRetry(url: string, options = {}) {
  for (let attempt = 0; attempt < FETCH_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error: any) {
      const isLastAttempt = attempt === FETCH_CONFIG.MAX_RETRIES - 1;
      
      if (isLastAttempt) {
        throw error;
      }

      // Calculate exponential backoff with jitter
      const backoff = Math.min(
        FETCH_CONFIG.INITIAL_BACKOFF * Math.pow(2, attempt) + Math.random() * 1000,
        FETCH_CONFIG.MAX_BACKOFF
      );
      
      console.log(`Retry ${attempt + 1}/${FETCH_CONFIG.MAX_RETRIES} after ${backoff}ms`);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  throw new Error('Max retries reached');
}

export function buildArxivQueryUrl(
    category?: string,
    keyword?: string,
    start: number = 0,
    maxResults: number = 10
  ): string {
    if (!category && !keyword) {
      return ""
    }
    let searchParts: string[] = [];
  

    if (keyword) {
      const keywordList: string[] = keyword.trim().split(" ");
      console.log("Keyword list:", keywordList);
      keywordList.forEach((word) => {
        if (word) {
          searchParts.push(`all:${word}`);
        }
      });
    }

    if (category) {
      searchParts.push(`cat:${category}`);
    }

    const searchQuery = searchParts.length > 1 ? searchParts.join("+AND+") : searchParts.length === 1 ?  searchParts[0] : "all:*";
    console.log("Search query:", searchQuery);
    let url = `https://export.arxiv.org/api/query?` +
                `search_query=${searchQuery}` +
                `&start=${start}` +
                `&max_results=${maxResults}` +
                `&sortBy=submittedDate` +
                `&sortOrder=descending`;

    console.log("Arxiv query URL:", url);
    return url
  }


  export function buildArxivQueryUrlByIds(ids: string | string[]): string {
    const idList = Array.isArray(ids) ? ids.join(",") : ids;
    const url = `https://export.arxiv.org/api/query?id_list=${idList}`;
    console.log("Arxiv query URL:", url);
    return url;
  }

  export async function fetchArxivByIds(ids: string | string[]) {
    const url = buildArxivQueryUrlByIds(ids);
    console.log("Fetching arXiv data for IDs:", Array.isArray(ids) ? ids : [ids]);
    
    try {
      const response = await fetch(url);
      const xml = await response.text();
      const parsed = await parseStringPromise(xml);
      
      if (!parsed.feed?.entry) {
        console.warn("No entries found in arXiv response");
        return [];
      }
  
      return parsed.feed.entry.map((entry: any) => ({
          primary_category: entry['arxiv:primary_category'][0]['$'].term,
          categories: entry.category.map((c: any) => c['$'].term).join(", "),
          title: entry.title[0].trim(),
          published: entry.published[0],
          link: entry.id[0],
          authors: entry.author.map((a: any) => a.name[0]).join(", "),
          summary: entry.summary[0].trim()
      }));
    } catch (error: any) {
      console.error("Failed to fetch arXiv data:", error);
      throw new Error(`Failed to fetch arXiv data: ${error.message}`);
    }
  }


  export async function fetchAndFilterArxiv(
    keyword?: string,
    category?: string,
    maxResults = 50
  ) {
    try {
      if (!category && !keyword) {
        throw new Error("No category or keyword provided");
      }
      
      const url = buildArxivQueryUrl(category, keyword, 0, maxResults);
      console.log("Fetching arXiv data for search query:", url);
      const response = await fetch(url); // Use fetchWithRetry
      const xml = await response.text();
      const parsed = await parseStringPromise(xml);
      
      if (!parsed.feed?.entry) {
        console.warn("No entries found in arXiv response for search query");
        return [];
      }
      
      const entries = parsed.feed.entry;
      console.log(entries[0]);
      return entries
        .map((entry: any) => ({
          primary_category: entry['arxiv:primary_category'][0]['$'].term,
          categories: entry.category.map((c: any) => c['$'].term).join(", "),
          title: entry.title[0].trim(),
          published: entry.published[0],
          link: entry.id[0],
          authors: entry.author.map((a: any) => a.name[0]).join(", "),
          summary: entry.summary[0].trim()
        }));
    } catch (error: any) {
      console.error("Failed to fetch and filter arXiv data:", error);
      throw new Error(`Failed to fetch and filter arXiv data: ${error.message}`);
    }
  }
