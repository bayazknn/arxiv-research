import { parseStringPromise } from "xml2js";


export function buildArxivQueryUrl(
    category?: string,
    keyword?: string,
    start: number = 0,
    maxResults: number = 10
  ): string {
    let searchParts: string[] = [];
  
    if (category) {
      searchParts.push(`cat:${category}`);
    }
  
    if (keyword) {
      // const encodedKeyword = `"${keyword}"`;
      const keywordList: string[] = keyword.trim().split(" ");
      // searchParts.push(`all:${keyword}`);
      console.log("Keyword list:", keywordList);
      keywordList.forEach((word) => {
        if (word) {
          searchParts.push(`all:${word}`);
        }
      });
    }

    const searchQuery = searchParts.length > 1 ? searchParts.join("+AND+") : searchParts.length === 1 ? searchParts[0] : "all:*";

    const url = `http://export.arxiv.org/api/query?` +
                `search_query=${searchQuery}` +
                `&start=${start}` +
                `&max_results=${maxResults}` +
                `&sortBy=submittedDate` +
                `&sortOrder=descending`;
    console.log("Arxiv query URL:", url);
    return url;
  }
  

export async function fetchAndFilterArxiv(
  category?: string,
  keyword?: string,
  dateFrom?: string,
  dateTo?: string,
  maxResults = 50
) {
  const url = buildArxivQueryUrl(category, keyword, 0, maxResults);
  const response = await fetch(url);
  const xml = await response.text();

  // Parse XML response
  const parsed = await parseStringPromise(xml);
  const entries = parsed.feed.entry || [];

  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  const filtered = entries.filter((entry: any) => {
    const published = new Date(entry.published[0]);

    if (fromDate && published < fromDate) return false;
    if (toDate && published > toDate) return false;

    return true;
  });

  return filtered.map((entry: any) => ({
    title: entry.title[0].trim(),
    published: entry.published[0],
    link: entry.id[0],
    authors: entry.author.map((a: any) => a.name[0]),
    summary: entry.summary[0].trim()
  }));
}
