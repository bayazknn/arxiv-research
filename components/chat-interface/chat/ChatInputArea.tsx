"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import type { Attachment } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X } from "lucide-react";
import { generateId } from "@/lib/utils";
import { FilePreviewItem } from "./FilePreviewItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isSending?: boolean;
}

export function ChatInputArea({ onSendMessage, isSending }: ChatInputAreaProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newAttachments: Attachment[] = filesArray.map((file) => {
        const attachment: Attachment = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          fileObject: file,
        };
        if (file.type.startsWith("image/")) {
          attachment.dataUrl = URL.createObjectURL(file);
        }
        return attachment;
      });
      setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5)); // Limit to 5 files
    }
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (fileId: string) => {
    const attachmentToRemove = attachments.find((att) => att.id === fileId);
    if (attachmentToRemove?.dataUrl) {
      URL.revokeObjectURL(attachmentToRemove.dataUrl);
    }
    setAttachments((prev) => prev.filter((att) => att.id !== fileId));
  };

  const handleSend = () => {
    if (text.trim() === "" && attachments.length === 0) return;
    onSendMessage(text, attachments);
    setText("");
    attachments.forEach((att) => {
      if (att.dataUrl) URL.revokeObjectURL(att.dataUrl);
    });
    setAttachments([]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-background shadow-inner">
      {attachments.length > 0 && (
        <ScrollArea className="mb-2 h-32">
          <div className="flex flex-wrap gap-2 p-1">
            {attachments.map((att) => (
              <FilePreviewItem key={att.id} attachment={att} onRemove={handleRemoveAttachment} />
            ))}
          </div>
        </ScrollArea>
      )}
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
          className="shrink-0">
          <Paperclip size={20} />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx" // Example file types
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message or drop files..."
          className="flex-1 resize-none min-h-[40px] max-h-[150px] text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={isSending || (text.trim() === "" && attachments.length === 0)}
          aria-label="Send message"
          size="icon"
          className="shrink-0 rounded-full w-10 h-10">
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
