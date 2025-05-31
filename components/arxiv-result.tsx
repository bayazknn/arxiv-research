import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArxivPaper, Workspace } from "@/types/workspace";
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
import { Loader2 } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";

interface ArxivResultsProps {
  paper: ArxivPaper;
}

type Inputs = {
  workspaceId: string;
};

export default function ArxivResult({ paper }: ArxivResultsProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const paperForm = useForm<Inputs>();
  const {userWorkspaces: workspaces} = useSidebar();
  const {setArxivPaper} = useChatStore();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const { workspaceId } = data;
    handleSave(paper, workspaceId);
  };
  
  const handleSave = async (paper: ArxivPaper, workspaceId: string) => {
    const payload = {
      ...paper,
      created_at: new Date().toISOString(),
      workspace_id: workspaceId,
    };

    const savePaper = async (payload: ArxivPaper) => {
      const res = await fetch("/api/paper/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).then((res) => res.json());
      console.log("Paper saved:", res);

      if (res.success) {
        setIsSaved(true);
        toast({
          title: "Paper saved",
          description: "Paper has been saved to your workspace.",
        });
        return res.data;
      } else {
        toast({
          title: "Paper not saved",
          description: "Paper has not been saved to your workspace.",
        });
        return res.error;
      }
    }
    
    setIsSaving(true);
    await savePaper(payload);
    setIsSaving(false);
    setArxivPaper(paper);
  }

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
                      {workspaces.map((workspace: Workspace) => (
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
            <Separator orientation="vertical" className="m-1"></Separator>
            {isSaving && <Loader2 className="animate-spin" />}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
