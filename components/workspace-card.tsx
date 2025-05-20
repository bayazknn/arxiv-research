import { Workspace } from "@/types/workspace";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <div className="flex flex-row max-w-4xl p-4 space-y-6 justify-start items-start">
      <div className="space-y-4">
        <Card className="w-32 h-32 items-center">
          <CardHeader className="items-center">
            <CardTitle>
              <h1 className="font-bold text-5xl">{workspace?.papers_count || 0}</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-4">papers</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col ml-4 space-y-2">
        <p>
          <span className="font-bold text-lg">{workspace.name}</span>
        </p>
        <p>
          <span className="text-md">{workspace.description}</span>
        </p>
        <p>
          <span className="text-sm text-muted-foreground">
            Created at: {new Date(workspace.created_at).toDateString()}
          </span>
        </p>
      </div>
    </div>
  );
}
