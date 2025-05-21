"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ExtraProps, Options, HooksOptions, UrlTransform, Components } from "react-markdown";
import { CodeBlockRenderer } from "./CodeBlockRenderer";

type MarkdownRendererProps = ExtraProps & {
  markdown: string;
  className?: string;
};

const CodeBlock = (props: any) => {
  const { node, inline, className, children } = props;
  const match = /(?:^|\s)language-(\w+)(?:\s|$)/.exec(className || "");
  if (!inline && match) {
    return <CodeBlockRenderer code={String(children).replace(/\n$/, "")} language={match[1]} />;
  }
  if (inline) {
    return <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">{children}</code>;
  }
  // For non-highlighted, multi-line code blocks (e.g. from user input or simple pre)
  return <CodeBlockRenderer code={String(children).replace(/\n$/, "")} language={"text"} />;
};

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeBlock,
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
