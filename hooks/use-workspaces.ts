import useSWR from 'swr';
import { createClient } from "@/utils/supabase/client";
import { Workspace } from "@/types/workspace";

const fetchWorkspaces = async (): Promise<Workspace[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("workspaces").select("*");

  if (error) {
    console.error("Error fetching workspaces:", error);
    throw new Error("Failed to fetch workspaces.");
  }
  return data || [];
};

export function useWorkspaces() {
  return useSWR<Workspace[]>('workspaces', fetchWorkspaces);
}