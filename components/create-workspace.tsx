import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
type CreateWorkspaceProps = {
  userId: string;
};
import { useSidebar } from "@/components/ui/sidebar";

export default function CreateWorkspace() {
  const { user, fetchUserContext } = useSidebar();
  const [createWorkspaceName, setCreateWorkspaceName] = useState("");
  const [createWorkspaceDescription, setCreateWorkspaceDescription] = useState("");

  const handleCreateWorkspace = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").insert([
      {
        name: createWorkspaceName.trim(),
        description: createWorkspaceDescription.trim(),
        created_at: new Date().toISOString(),
        user_id: user.id,
      },
    ]);
    if (error) {
      console.error("Error creating workspace:", error);
    } else {
      console.log("Created workspace:", data);
      setCreateWorkspaceName("");
      setCreateWorkspaceDescription("");
      fetchUserContext();
    }
  };

  return (
    <div className="flex p-1 items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Workspace</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>Fill in the details for your new workspace.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={createWorkspaceName}
                className="col-span-3"
                onChange={(e) => setCreateWorkspaceName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={createWorkspaceDescription}
                className="col-span-3"
                onChange={(e) => setCreateWorkspaceDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => handleCreateWorkspace()}>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
