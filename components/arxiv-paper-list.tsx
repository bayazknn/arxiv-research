"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Added Input component
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Calendar, Users, Tag, BookOpen, Trash2, Star } from "lucide-react";
import { ArxivPaper, Workspace } from "@/types/workspace";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ArxivPapersListProps {
  papers: ArxivPaper[];
  workspace: Workspace;
  onRemovePaper?: (paperId: string) => Promise<{ result: { succes: boolean } } | undefined>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

interface PaperCardProps {
  paper: ArxivPaper;
  // onOpenPaper?: (paper: ArxivPaper) => void;
  onRemovePaper?: (paperId: string) => Promise<{ result: { succes: boolean } } | undefined>;
}

function PaperCard({ paper, onRemovePaper }: PaperCardProps) {
  const router = useRouter();
  const categories = paper.categories.split(" ").slice(0, 3);

  return (
    <Card className="group relative hover:shadow-lg transition-all duration-200 hover:z-10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-6 mb-2 group-hover:text-primary transition-colors">
              {paper.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {truncateText(paper.authors, 60)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(paper.published)}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              onClick={() => onRemovePaper?.(paper.id!)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{truncateText(paper.summary, 200)}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          <Button variant="outline" size="sm" className="ml-4" onClick={() => router.push(`/paper?link=${paper.link}`)}>
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ArxivPapersList({ papers, workspace, onRemovePaper }: ArxivPapersListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRemovePaper = async (paperId: string): Promise<{ result: { succes: boolean } } | undefined> => {
    if (onRemovePaper) {
      const result = await onRemovePaper(paperId); // Await the promise
      if (result?.result?.succes) {
        // Safely check the success property
        toast({
          title: "Deleted",
          description: "Paper deleted successfully",
          className: "bg-green-50 border-green-500 text-green-900 shadow-lg",
        });
        return { result: { succes: true } }; // Explicitly return success object
      } else {
        toast({
          title: "Error", // Changed title to Error for failed deletion
          description: "Failed to delete paper.", // More specific error message
          className: "bg-red-50 border-red-500 text-red-900 shadow-lg",
        });
        return undefined; // Explicitly return undefined on failure
      }
    }
    return undefined; // Return undefined if onRemovePaper is not provided
  };

  const filteredPapers = papers.filter((paper) => paper.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col max-w-6xl mx-auto p-6">
      {/* Workspace Header */}
      <div className="mb-8">
        {workspace ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
            </div>
            <p className="text-muted-foreground text-lg">{workspace.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>{papers.length} papers</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Created {formatDate(workspace.created_at.toString())}</span>
            </div>
          </>
        ) : (
          <p>Loading workspace...</p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search papers by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No papers found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "No papers match your search criteria."
              : "Start adding ArXiv papers to your workspace to see them here."}
          </p>
        </Card>
      ) : (
        <ScrollArea className="h-[700px] w-full rounded-md border p-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {filteredPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} onRemovePaper={handleRemovePaper} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
