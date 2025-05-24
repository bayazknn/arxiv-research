import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArxivPaper } from "@/types/workspace";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "./ui/sidebar";

interface ArxivResultsProps {
  paper: ArxivPaper;
}

type Inputs = {
  workspaceId: string;
};

export default function ArxivResult({ paper }: ArxivResultsProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const paperForm = useForm<Inputs>();
  const { userWorkspaces, user } = useSidebar();

  // const savePaperForm = useForm<Inputs>();
  // const savePaperFormArr = results.map((paper) => useForm<Inputs>());
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const { workspaceId } = data;
    handleSave(paper, workspaceId);
  };

  const handleSave = async (paper: ArxivPaper, workspaceId: string) => {
    const supabase = createClient();
    const { data: existedPaper, error: fetchError } = await supabase
      .from("papers")
      .select()
      .eq("workspace_id", workspaceId)
      .eq("link", paper.link);

    if (fetchError) {
      console.error("Error fetching saved papers:", fetchError);
      return;
    }

    if (existedPaper.length > 0) {
      toast({
        title: "Paper already saved",
        description: `${paper.title}`,
        className: "bg-red-50 border-red-500 text-red-900 shadow-lg",
      });
      setIsSaved(true);
      return;
    } else {
      const payload = {
        ...paper,
        created_at: new Date().toISOString(),
        workspace_id: workspaceId,
        user_id: user.id,
        email: user.email,
      };

      const { data, error } = await supabase.from("papers").insert([payload]);
      if (error) {
        console.error("Error saving paper:", error);
      } else {
        toast({
          title: "Paper saved",
          description: `${paper.title}`,
          className: "bg-green-50 border-green-500 text-green-900 shadow-lg",
        });
        setIsSaved(true);
      }
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <a href={paper.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {paper.title}
              </a>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {paper.authors} &mdash; {new Date(paper.published).toDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-8">{paper.summary}</p>
          </CardContent>
          <CardFooter>
            {paperForm && (
              <Form {...paperForm}>
                <form onSubmit={paperForm.handleSubmit(onSubmit)} className="flex items-center space-x-2">
                  <Select onValueChange={(value) => paperForm.setValue("workspaceId", value)} defaultValue={""}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {userWorkspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={isSaved}>
                    Save
                  </Button>
                </form>
              </Form>
            )}
            <Separator orientation="vertical" className="m-1"></Separator>
            <Button onClick={() => router.push(`/paper?link=${paper.link}`)}>Open</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
