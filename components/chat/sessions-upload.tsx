import { useState, useEffect } from "react";
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
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DatabaseBackupIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { usePaperWorkspace } from "@/hooks/use-paper-workspace";

/**
 * SessionsUpload component for managing and uploading chat sessions to a selected workspace.
 * It fetches available workspaces and the current paper's associated workspace,
 * allows the user to select a workspace, and uploads chat sessions from local storage.
 */
export default function SessionsUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const link = searchParams.get("link");

  // Fetch workspaces using the custom SWR hook
  const { data: workspaces, error: workspacesError } = useWorkspaces();
  // Fetch paper workspace using the custom SWR hook, dependent on 'link'
  const { data: paper, error: paperError } = usePaperWorkspace(link);

  /**
   * Handles errors when fetching workspaces.
   */
  useEffect(() => {
    if (workspacesError) {
      console.error("Error fetching workspaces:", workspacesError);
      toast({
        title: "Error",
        description: "Failed to load workspaces.",
        className: "bg-red-50 border-red-500 text-red-900 shadow-lg",
      });
    }
  }, [workspacesError, toast]);

  /**
   * Handles errors when fetching paper data and sets the selected workspace
   * if a paper's workspace ID is found.
   */
  useEffect(() => {
    if (paperError) {
      console.error("Error fetching paper:", paperError);
      toast({
        title: "Error",
        description: "Failed to load paper details.",
        className: "bg-red-50 border-red-500 text-red-900 shadow-lg",
      });
    }
    if (paper?.workspace_id) {
      setSelectedWorkspace(paper.workspace_id);
    }
  }, [paper, paperError, toast]);

  /**
   * Handles the opening and closing of the dialog.
   * @param open - Boolean indicating if the dialog is open.
   */
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  /**
   * Handles the upload of chat sessions to the selected workspace.
   * Retrieves sessions from local storage and sends them to the API route.
   */
  const handleUploadSessions = async () => {
    if (!link) {
      console.error("No link found in search params.");
      toast({
        title: "Upload Failed",
        description: "Missing paper link.",
        className: "bg-red-50 border-red-500 text-red-900 shadow-lg",
      });
      return;
    }

    const sessionArray = localStorage.getItem(link);
    const data = {
      sessions: sessionArray ? JSON.parse(sessionArray) : [],
      link: link,
      workspaceId: selectedWorkspace,
    };
    setIsUploading(true);

    try {
      const response = await fetch("/api/save_chat_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload sessions.");
      }

      const result = await response.json();
      console.log("handle upload session success: ", result);

      toast({
        title: "Synced Chat Session",
        description: "All sessions files are uploaded",
        className: "bg-green-50 border-green-500 text-green-900 shadow-lg",
      });

      setIsDialogOpen(false); // Close dialog on success
    } catch (error: any) {
      console.error("handle upload session error: ", error);
      toast({
        title: "Synced Chat Session Failed",
        description: error.message || "All sessions files failed to upload",
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
              <Select value={selectedWorkspace || ""} onValueChange={(value) => setSelectedWorkspace(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Workspaces</SelectLabel>
                    {(workspaces || []).map((ws) => (
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
                disabled={!selectedWorkspace || isUploading}>
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
