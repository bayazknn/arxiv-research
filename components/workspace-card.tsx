import { ArxivPaper, Workspace } from "@/types/workspace";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

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

type WorkspaceCardProps = {
  workspace: Workspace;
  papers: ArxivPaper[];
};

export default function WorkspaceCard({ workspace, papers }: WorkspaceCardProps) {
  return (
    <>
      <div className="flex flex-row max-w-4xl p-4 space-y-6 justify-start items-start">
        <div className="space-y-4">
          <Card className="w-32 h-32 items-center mb-4">
            <CardHeader className="items-center">
              <CardTitle>
                <h1 className="font-bold text-5xl">{papers?.length || 0}</h1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-4">papers</p>
            </CardContent>
          </Card>
        </div>
        {/* <div className="flex flex-col ml-4 space-y-2">
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
        </div> */}
      </div>
      <div>
        <div className="flex flex-col max-w-4xl p-4 space-y-6 justify-start items-start">
          <div className="space-y-4">
            <Table className="w-screen">
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Title</TableHead>
                  <TableHead className="w-[100px]">Authors</TableHead>
                  <TableHead className="w-[100px]">Published</TableHead>
                  <TableHead className="w-[100px]">Categories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers?.map((paper) => {
                  return (
                    <TableRow key={paper.id}>
                      <TableCell className="font-medium">
                        {/* <a
                          href={`/paper?link=${paper.link.replace("abs", "pdf")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline">
                          {paper.title}
                        </a> */}
                        {paper.title}
                      </TableCell>
                      <TableCell className="font-medium">{paper.authors}</TableCell>
                      <TableCell className="font-medium">{paper.published}</TableCell>
                      <TableCell className="font-medium">{paper.categories}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
