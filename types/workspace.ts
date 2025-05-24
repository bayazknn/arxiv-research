export interface Workspace {
  id: string;
  name: string;
  description: string;
  created_at: string;
  saved_papers?: SavedPaper[];
  papers_count?: number;
}


export interface ArxivQueryParams {
  query: string;
  category: "cs.AI" | "cs.LG";
  maxResults: number;
}


export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  link: string;
  categories: string[];
  primary_category: string;
  workspace_id?: string;
}

export interface SavedPaper {
  id?: string;
  created_at: string;
  link: string;
  workspace_id: string;
}