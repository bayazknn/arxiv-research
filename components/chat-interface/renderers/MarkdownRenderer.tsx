"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CodeProps } from "react-markdown/lib/ast-to-react";
import { CodeBlockRenderer } from "./CodeBlockRenderer";

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm dark:prose-invert max-w-none"
      components={{
        code({ node, inline, className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || "");
          if (!inline && match) {
            return <CodeBlockRenderer code={String(children).replace(/\n$/, "")} language={match[1]} />;
          }
          if (inline) {
            return <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">{children}</code>;
          }
          // For non-highlighted, multi-line code blocks (e.g. from user input or simple pre)
          return <CodeBlockRenderer code={String(children).replace(/\n$/, "")} language={"text"} />;
        },
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
      }}>
      {markdown}
    </ReactMarkdown>
  );
}
