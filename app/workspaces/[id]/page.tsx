"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Workspace } from "@/types/workspace";
import WorkspaceCard from "@/components/workspace-card";

export default function WorkspaceDetails() {
  const pathname = usePathname();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace | null>(null);

  useEffect(() => {
    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    setWorkspaceId(id);
    getWorkspaceDetails(id);
    getWorkspacePapers(id);
  }, [pathname]);

  const getWorkspacePapers = async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("papers").select().eq("workspace_id", id);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log("Fetched data:", data);
    }
    if (error) {
      console.error("Error fetching workspace papers:", error);
    } else {
      console.log("Fetched workspace papers:", data);
      setWorkspaceDetails((prev) => ({ ...prev, papers_count: data.length, saved_papers: data }) as Workspace);
    }
  };

  const getWorkspaceDetails = async (id: string) => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("papers")
      .select("*, workspaces(*)") // Select all columns from papers and all columns from workspaces
      .eq("workspaces.user_id", user?.id); // Filter by user_id in the workspaces table
    if (error) {
      console.error("Error fetching workspace details:", error);
    } else {
      console.log("Fetched workspace details:", data);
      if (data && data.length > 0 && data[0].workspaces && data[0].workspaces.length > 0) {
        setWorkspaceDetails(data[0].workspaces[0] as Workspace);
      } else {
        setWorkspaceDetails(null);
      }
    }
  };

  return (
    <>
      <div className="flex flex-row p-4 justify-start items-start">
        <div>{workspaceDetails && <WorkspaceCard workspace={workspaceDetails} />}</div>
      </div>
    </>
  );
}
