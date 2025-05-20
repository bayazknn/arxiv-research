"use client";

import type { ChatMessage, Attachment } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate, formatBytes } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/chat-interface/renderers/MarkdownRenderer";
import { CodeBlockRenderer } from "@/components/chat-interface/renderers/CodeBlockRenderer";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, Image as ImageIcon, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const { toast } = useToast();

  const handleCopyText = async (textToCopy: string | undefined) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({ title: "Copied!", description: "Message content copied." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy content.", variant: "destructive" });
    }
  };

  const renderContent = () => {
    if (message.displayType === "markdown" && message.text) {
      return <MarkdownRenderer markdown={message.text} />;
    }
    if (message.displayType === "code" && message.text) {
      return <CodeBlockRenderer code={message.text} language={message.codeLanguage} />;
    }
    if (message.displayType === "terminal" && message.text) {
      // Terminal is treated like code for now
      return <CodeBlockRenderer code={message.text} language={message.codeLanguage || "bash"} />;
    }
    if (message.text) {
      return <p className="whitespace-pre-wrap">{message.text}</p>;
    }
    return null;
  };

  const AttachmentDisplay = ({ att }: { att: Attachment }) => (
    <Card className="mt-2 max-w-xs shadow-sm border border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {att.type.startsWith("image/") && att.dataUrl ? (
            <div className="w-12 h-12 rounded overflow-hidden relative">
              <NextImage src={att.dataUrl} alt={att.name} layout="fill" objectFit="cover" />
            </div>
          ) : att.type.startsWith("image/") ? (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          ) : (
            <FileText className="w-8 h-8 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium truncate" title={att.name}>
              {att.name}
            </p>
            <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("flex items-end gap-2 my-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 self-start shadow-sm">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Sparkles size={18} />
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          "max-w-[75%] rounded-2xl shadow-md",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border"
        )}>
        <CardContent className="p-3 text-sm">
          {renderContent()}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((att) => (
                <AttachmentDisplay key={att.id} att={att} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-end mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {message.text &&
              (message.displayType === "markdown" ||
                message.displayType === "code" ||
                message.displayType === "terminal" ||
                isUser) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={() => handleCopyText(message.text)}
                  aria-label="Copy message text">
                  <Copy size={12} />
                </Button>
              )}
            <span className="text-xs">{formatDate(message.timestamp)}</span>
          </div>
        </CardContent>
      </Card>
      {isUser && (
        <Avatar className="h-8 w-8 self-start shadow-sm">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
