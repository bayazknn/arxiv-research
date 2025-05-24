"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react"; // Import useMemo
import { createClient } from "@/utils/supabase/client";
import { ArxivPaper, Workspace } from "@/types/workspace";
import { useSidebar } from "@/components/ui/sidebar";
import ArxivPapersList from "@/components/arxiv-paper-list";

export default function WorkspaceDetails() {
  const { userId, userWorkspaces } = useSidebar();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []); // Memoize the Supabase client
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>();

  const getWorkspacePapers = async (id: string) => {
    const { data, error } = await supabase.from("papers").select().eq("workspace_id", id).eq("user_id", userId);
    if (error) {
      console.log("Error fetching data at workspace by id:", error);
    } else {
      setPapers(data);
    }
  };

  useEffect(() => {
    console.log(pathname.split("/"));
    const workspaceId = pathname.split("/")[2];
    console.log("useEffect workspaceId:", workspaceId);
    setWorkspace(userWorkspaces.find((workspace) => workspace.id === workspaceId));
    if (userId) {
      // Only fetch papers if userId is available
      getWorkspacePapers(workspaceId);
    }
  }, [pathname, userId, userWorkspaces]); // Add userId and userWorkspaces to dependencies

  const handleRemovePaper = useCallback(
    async (paperId: string): Promise<{ result: { succes: boolean } } | undefined> => {
      const { data, error } = await supabase.from("papers").delete().eq("id", paperId);
      if (error) {
        console.error("Error removing paper:", error.message || error);
        return undefined; // Explicitly return undefined to match the type signature
      } else {
        setPapers(papers.filter((paper) => paper.id !== paperId));
        return { result: { succes: true } };
      }
    },
    [papers]
  );

  return (
    <>
      <div className="flex flex-col p-4 justify-start items-start">
        {workspace ? (
          <ArxivPapersList papers={papers} workspace={workspace} onRemovePaper={handleRemovePaper} />
        ) : (
          <p>Loading workspace...</p>
        )}
      </div>
    </>
  );
}
