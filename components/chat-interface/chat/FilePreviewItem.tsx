"use client";

import type { Attachment } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { formatBytes } from "@/lib/utils";

interface FilePreviewItemProps {
  attachment: Attachment;
  onRemove: (fileId: string) => void;
}

export function FilePreviewItem({ attachment, onRemove }: FilePreviewItemProps) {
  const isImage = attachment.type.startsWith("image/");

  return (
    <Card className="w-full max-w-xs shadow-sm overflow-hidden">
      <CardHeader className="p-3 flex flex-row items-center justify-between bg-muted/50">
        <CardTitle className="text-sm truncate flex items-center gap-2">
          {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
          <span className="truncate" title={attachment.name}>
            {attachment.name}
          </span>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onRemove(attachment.id)}
          aria-label="Remove file">
          <X size={16} />
        </Button>
      </CardHeader>
      <CardContent className="p-3 text-xs text-muted-foreground">
        {isImage && attachment.dataUrl && (
          <div className="mb-2 rounded overflow-hidden aspect-video relative">
            <Image src={attachment.dataUrl} alt={attachment.name} layout="fill" objectFit="cover" />
          </div>
        )}
        <p>Type: {attachment.type}</p>
        <p>Size: {formatBytes(attachment.size)}</p>
      </CardContent>
    </Card>
  );
}
