"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Workspace, ArxivQueryParams, ArxivPaper } from "@/types/workspace";
import { useForm, SubmitHandler } from "react-hook-form";
import { fetchAndFilterArxiv } from "@/utils/arxiv/arxiv-search";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ArxivResults from "@/components/arxiv-results";
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
      console.error("Error fetching workspace papers:", error);
    } else {
      console.log("Fetched workspace papers:", data);
      setWorkspaceDetails((prev) => ({ ...prev, papers_count: data.length, saved_papers: data }) as Workspace);
    }
  };

  const getWorkspaceDetails = async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").select().eq("id", id).single();
    if (error) {
      console.error("Error fetching workspace details:", error);
    } else {
      console.log("Fetched workspace details:", data);
      setWorkspaceDetails(data);
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
