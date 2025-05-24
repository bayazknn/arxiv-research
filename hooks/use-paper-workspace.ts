import useSWR from 'swr';
import { createClient } from "@/utils/supabase/client";
import { ArxivPaper } from "@/types/workspace";

const fetchPaperWorkspace = async (link: string): Promise<ArxivPaper | null> => {
  if (!link) {
    console.error("No link provided for fetching paper workspace.");
    return null;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("papers").select("*").eq("link", link);

  if (error) {
    console.error("Error fetching paper:", error);
    throw new Error("Failed to fetch paper workspace.");
  }
  return data?.[0] || null;
};

export function usePaperWorkspace(link: string | null) {
  return useSWR<ArxivPaper | null>(link ? ['paperWorkspace', link] : null, () => fetchPaperWorkspace(link as string));
}