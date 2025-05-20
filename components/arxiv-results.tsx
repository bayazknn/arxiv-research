import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArxivPaper, SavedPaper, Workspace } from "@/types/workspace";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface ArxivResultsProps {
  results: ArxivPaper[];
  workspaces: Workspace[];
}

type Inputs = {
  workspaceId: string;
  link: string;
};

export default function ArxivResults({ results, workspaces }: ArxivResultsProps) {
  const [savedPapers, setSavedPapers] = useState<string[]>([]);
  const router = useRouter();

  // const savePaperForm = useForm<Inputs>();
  const savePaperFormArr = results.map((paper) => useForm<Inputs>());
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const { workspaceId, link } = data;
    handleSave(link, workspaceId);
  };

  const handleSave = async (link: string, workspaceId: string) => {
    console.log("Saving paper:", link, workspaceId);
    const supabase = createClient();
    const { data: saved_papers, error: fetchError } = await supabase
      .from("papers")
      .select()
      .eq("workspace_id", workspaceId)
      .eq("link", link);

    if (fetchError) {
      console.error("Error fetching saved papers:", fetchError);
      return;
    }

    if (saved_papers?.length > 0) {
      console.log("Paper already saved:", saved_papers);
      setSavedPapers((prev) => [...prev, link]);
      return;
    } else {
      const toSavedPaper = {
        created_at: new Date().toISOString(),
        link: link,
        workspace_id: workspaceId,
      } as SavedPaper;

      const { data, error } = await supabase.from("papers").insert([toSavedPaper]);
      if (error) {
        console.error("Error saving paper:", error);
      } else {
        console.log("Saved paper:", data);
        setSavedPapers((prev) => [...prev, link]);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-4">
        {results?.map((paper, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-lg">
                <a href={paper.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {paper.title}
                </a>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {paper.authors.join(", ")} &mdash; {new Date(paper.published).toDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-8">{paper.summary}</p>
            </CardContent>
            <CardFooter>
              <Form {...savePaperFormArr[i]} key={`${i}-form`}>
                <form onSubmit={savePaperFormArr[i].handleSubmit(onSubmit)} className="flex items-center space-x-2">
                  <Select
                    key={`${i}-workspaceId`}
                    onValueChange={(value) => savePaperFormArr[i].setValue("workspaceId", value)}
                    defaultValue={""}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input key={`${i}-link`} type="hidden" value={paper.link} {...savePaperFormArr[i].register("link")} />
                  <Button type="submit" disabled={savedPapers.includes(paper.link)}>
                    Save
                  </Button>
                </form>
              </Form>
              <Separator orientation="vertical" className="m-1"></Separator>
              <Button onClick={() => router.push(`/paper?link=${paper.link}`)}>Open</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
