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

type Inputs = {
  keyword: string;
  category: "cs.AI" | "cs.LG";
};

export default function WorkspaceDetails() {
  const pathname = usePathname();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace | null>(null);
  const [arxivResults, setArxivResults] = useState<ArxivPaper[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const searchForm = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const { keyword, category } = data;
    fetchAndFilterArxiv(category, keyword)
      .then((results) => {
        console.log("Search results:", results);
        setArxivResults(results);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  useEffect(() => {
    getWorkspaces();
  }, []);

  const getWorkspaces = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").select();
    if (error) {
      console.error("Error fetching workspaces:", error);
    } else {
      console.log("Fetched workspaces:", data);
      setWorkspaces(data);
    }
  };

  const getWorkspacePapers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("papers").select();
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
      <div className="flex flex-row m-4 gap-4 justify-end items-center mt-4">
        <Form {...searchForm}>
          <FormField
            name="keyword"
            control={searchForm.control}
            render={() => (
              <FormItem>
                <FormLabel />
                <FormControl>
                  <Input placeholder="Enter your search keyword" type="text" {...searchForm.register("keyword")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={searchForm.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      <SelectItem value="cs.AI">Artificial Intelligence</SelectItem>
                      <SelectItem value="cs.LG">Machine Learning</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" onClick={searchForm.handleSubmit(onSubmit)}>
            Search
          </Button>
        </Form>
      </div>
      {arxivResults.length > 0 && <ArxivResults results={arxivResults} workspaces={workspaces} />}
    </>
  );
}
