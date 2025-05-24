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
import CreateWorkspace from "@/components/create-workspace";
import { Separator } from "@/components/ui/separator";
import { Workspace } from "@/types/workspace";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

export default function Page() {
  const { user, userWorkspaces, fetchUserContext } = useSidebar();
  const router = useRouter();

  // const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  // const [user, setUser] = useState<any | null>(null);

  // useEffect(() => {
  //   fetchWorkspaces();
  //   const getUser = async () => {
  //     const supabase = createClient();
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     console.log("User id:", user?.id);
  //     setUser(user ?? null);
  //   };
  //   getUser();
  // }, []);

  // const fetchWorkspaces = async () => {
  //   const supabase = createClient();
  //   const { data, error } = await supabase.from("workspaces").select();
  //   if (error) {
  //     console.error("Error fetching workspaces:", error);
  //   } else {
  //     console.log("Fetched workspaces:", data);
  //     setWorkspaces(data);
  //   }
  // };

  // const updateWorkspaces = async () => {
  //   fetchWorkspaces();
  // };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);
    if (error) {
      console.error("Error deleting workspace:", error);
    } else {
      console.log("Deleted workspace with id:", workspaceId);
      fetchUserContext();
    }
  };

  return (
    <div className="flex flex-col m-4 gap-4">
      <div className="flex justify-end">
        <CreateWorkspace />
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
          {userWorkspaces.map((workspace) => (
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
