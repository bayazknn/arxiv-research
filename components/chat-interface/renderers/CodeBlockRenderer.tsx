"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockRendererProps {
  code: string;
  language?: string;
}

export function CodeBlockRenderer({ code, language }: CodeBlockRendererProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setHasCopied(true);
      toast({ title: "Copied!", description: `${language || 'Content'} copied to clipboard.` });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy.", variant: "destructive" });
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="relative group bg-secondary/50 p-4 rounded-md my-2">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {hasCopied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
      <pre className="text-sm overflow-x-auto font-mono">
        <code className={language ? `language-${language}` : ""}>{code}</code>
      </pre>
    </div>
  );
}
