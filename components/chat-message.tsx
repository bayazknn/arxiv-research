"use client";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreVertical, Tag, User, Bot, Trash } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  message: Message;
  sessionId: string;
  onDelete?: (sessionId: string, messageId: string) => void;
  onAnnotate?: (sessionId: string, messageId: string) => void;
}

export function ChatMessage({ message, sessionId, onDelete, onAnnotate }: ChatMessageProps) {
  const handleCopyMessage = () => {
    const text = message.content.map((c) => c.content).join("\n");
    navigator.clipboard.writeText(text);
  };

  const handleDeleteMessage = () => {
    if (onDelete) {
      onDelete(sessionId, message.id);
    }
  };

  const handleAnnotateMessage = () => {
    if (onAnnotate) {
      onAnnotate(sessionId, message.id);
    }
  };

  // Function to get a random color for tags
  const getRandomColor = () => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Function to properly extract tags from annotations
  const extractTags = (annotation: any): string[] => {
    if (!annotation.tags) return [];

    if (Array.isArray(annotation.tags)) {
      // If it's already an array, flatten any comma-separated values
      return annotation.tags
        .flatMap((tag: string) => (typeof tag === "string" ? tag.split(",").map((t) => t.trim()) : tag))
        .filter(Boolean);
    }

    // If it's a string, split by commas
    if (typeof annotation.tags === "string") {
      return annotation.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    }

    return [];
  };

  // Safe rendering of markdown content
  const renderMarkdown = (content: string) => {
    try {
      return <ReactMarkdown>{content || ""}</ReactMarkdown>;
    } catch (error) {
      console.error("Error rendering markdown:", error);
      return <div>{content || ""}</div>;
    }
  };

  const isUser = message.role === "user";

  return (
    <div className={cn("group", isUser ? "bg-muted/50" : "bg-background")}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              isUser ? "bg-primary text-primary-foreground" : "bg-blue-500 text-white"
            )}>
            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </div>

          {/* Message content */}
          <div className="flex-1 overflow-hidden">
            {message.annotations && message.annotations.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {message.annotations.flatMap((annotation, annotationIndex) => {
                  const tags = extractTags(annotation);
                  return tags.map((tag, tagIndex) => (
                    <Badge
                      key={`${annotationIndex}-${tagIndex}`}
                      variant="outline"
                      className={cn("text-xs", annotation.color || getRandomColor())}>
                      {tag}
                    </Badge>
                  ));
                })}
              </div>
            )}

            <div className="space-y-4">
              {message.content.map((content, index) => {
                if (content.type === "text") {
                  return (
                    <div key={index} className="whitespace-pre-wrap">
                      {content.content || ""}
                    </div>
                  );
                } else if (content.type === "markdown") {
                  return (
                    <div key={index} className="prose max-w-none">
                      {renderMarkdown(content.content || "")}
                    </div>
                  );
                } else if (content.type === "code") {
                  return (
                    <div key={index} className="relative">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(content.content || "");
                          }}
                          type="button">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        language={content.language || "javascript"}
                        style={vscDarkPlus}
                        className="rounded-md">
                        {content.content || ""}
                      </SyntaxHighlighter>
                    </div>
                  );
                } else if (content.type === "terminal") {
                  return (
                    <div key={index} className="relative">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(content.content || "");
                          }}
                          type="button">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-black rounded-md p-4 font-mono text-sm text-green-400 overflow-x-auto">
                        {content.content.split("\n").map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  );
                } else if (content.type === "file") {
                  if (content.fileType?.startsWith("image/")) {
                    return (
                      <div key={index} className="max-w-md">
                        <img
                          src={content.content || "/placeholder.svg"}
                          alt={content.fileName || "Uploaded image"}
                          className="rounded-md max-w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{content.fileName}</p>
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <div className="bg-muted-foreground/20 p-2 rounded">
                        <span className="text-xs font-bold uppercase">
                          {content.fileName?.split(".").pop() || "file"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">{content.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {content.fileSize ? `${Math.round(content.fileSize / 1024)} KB` : ""}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCopyMessage()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={() => handleDeleteMessage()}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                {onAnnotate && (
                  <DropdownMenuItem onClick={() => handleAnnotateMessage()}>
                    <Tag className="mr-2 h-4 w-4" />
                    Annotate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
