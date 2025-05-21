"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { HTMLAttributes } from "react";

interface CodeProps extends HTMLAttributes<HTMLElement> {
  node: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

import { CodeBlockRenderer } from "./CodeBlockRenderer";

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
        }}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
