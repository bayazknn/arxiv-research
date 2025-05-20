"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Workspace } from "@/types/workspace";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [createWorkspaceName, setCreateWorkspaceName] = useState("");
  const [createWorkspaceDescription, setCreateWorkspaceDescription] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("User id:", user?.id);
      setUser(user ?? null);
    };
    getUser();
  }, []);

  const fetchWorkspaces = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").select();
    if (error) {
      console.error("Error fetching workspaces:", error);
    } else {
      console.log("Fetched workspaces:", data);
      setWorkspaces(data);
    }
  };

  const handleCreateWorkspace = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").insert([
      {
        name: createWorkspaceName,
        description: createWorkspaceDescription,
        created_at: new Date().toISOString(),
        user_id: user?.id ?? null,
      },
    ]);
    if (error) {
      console.error("Error creating workspace:", error);
    } else {
      console.log("Created workspace:", data);
      fetchWorkspaces();
      setCreateWorkspaceName("");
      setCreateWorkspaceDescription("");
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);
    if (error) {
      console.error("Error deleting workspace:", error);
    } else {
      console.log("Deleted workspace with id:", workspaceId);
      fetchWorkspaces();
    }
  };

  return (
    <div className="flex flex-col m-4 gap-4">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Workspace</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>Fill in the details for your new workspace.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await handleCreateWorkspace();
              }}>
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
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspaces.map((workspace) => (
            <TableRow key={workspace.id}>
              <TableCell>{workspace.name}</TableCell>
              <TableCell>{workspace.description}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/workspaces/${workspace.id}`)}>Open</button>
                  <Separator orientation="vertical" className="h-5" />
                  <button onClick={() => handleDeleteWorkspace(workspace.id)}>Delete</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
