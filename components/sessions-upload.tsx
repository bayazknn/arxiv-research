import { ArxivPaper, Workspace } from "@/types/workspace";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DatabaseBackupIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SessionsUpload() {
  const [worksapces, setWorkspaces] = useState<Workspace[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedWorspace, setSelectedWorkspace] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const searcParams = useSearchParams();

  const handleFetchWorkspaces = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").select("*");
    if (error) {
      console.error("Error fetching workspaces:", error);
    } else {
      console.log("fetched workspaces for sessions upload: ", data);
      setWorkspaces(data);
      return data;
    }
  };

  const getPaperWorkspace = async () => {
    const supabase = createClient();
    const link = searcParams.get("link");
    if (!link) {
      console.error("No link in search params found");
      return;
    }
    const { data, error } = await supabase.from("papers").select("*").eq("link", link);

    if (error) {
      console.error("Error fetching paper:", error);
    } else {
      console.log("getPaperWorkspace: ", data);
      const workspaceId = data?.[0]?.workspace_id;
      workspaceId && setSelectedWorkspace(workspaceId);
    }
  };

  // useEffect(() => {
  //   handleFetchWorkspaces();
  //   getPaperWorkspace();
  // }, []);

  // Handle dialog open/close and trigger data fetching
  const handleDialogOpenChange = async (open: boolean) => {
    setIsDialogOpen(open);

    if (open) {
      // Fetch workspaces and paper workspace when dialog opens
      await Promise.all([handleFetchWorkspaces(), getPaperWorkspace()]);
    }
  };

  const handleUploadSessions = async () => {
    const localStorageKey = searcParams.get("link");
    if (!localStorageKey) {
      console.error("No localStorageKey found");
      return;
    }
    const sessionArray = localStorage.getItem(localStorageKey);
    const data = {
      sessions: sessionArray ? JSON.parse(sessionArray) : [],
      link: localStorageKey,
      workspaceId: selectedWorspace,
    };
    setIsUploading(true);

    try {
      const response = await fetch("/api/save_chat_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("handle upload session success: ", result);

      toast({
        title: "Synced Chat Session",
        description: "All sessions files are uploaded",
        className: "bg-green-50 border-green-500 text-green-900 shadow-lg",
      });

      setIsDialogOpen(false); // Close dialog on success
    } catch (error) {
      console.log("handle upload session error: ", error);
      toast({
        title: "Synced Chat Session Failed",
        description: "All sessions files failed to upload",
        className: "bg-red-50 border-red-500 text-red-900 shadow-lg",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex p-1 items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isUploading}>
            <DatabaseBackupIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose workspace to upload</DialogTitle>
            <DialogDescription>Workspaces are in dropdown</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Select value={selectedWorspace || ""} onValueChange={(value) => setSelectedWorkspace(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Workspaces</SelectLabel>
                    {worksapces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                onClick={handleUploadSessions}
                size="icon"
                variant="outline"
                type="button"
                disabled={!selectedWorspace || isUploading}>
                Save
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isUploading && <Badge className="bg-green-600 text-white">Chat sessions are uploading</Badge>}
    </div>
  );
}
