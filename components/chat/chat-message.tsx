"use client"
import React from "react"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, MoreVertical, Tag, User, Bot, Trash, Check } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import prism from "react-syntax-highlighter/dist/esm/styles/prism/prism"
import { ToolResult } from "./tool-result"
import { useToast } from "@/hooks/use-toast"
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message
  sessionId: string
  onDelete?: (sessionId: string, messageId: string) => void
  onAnnotate?: (sessionId: string, messageId: string) => void
}

export const ChatMessage = React.memo(function ChatMessage({ message, sessionId, onDelete, onAnnotate }: ChatMessageProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleCopyMessage = async () => {
    const text = message.content.map((c) => c.content).join("\n")
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedStates((prev) => ({ ...prev, [id]: true }))

      toast({
        title: "Code copied!",
        description: "Code block copied to clipboard",
      })

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = () => {
    if (onDelete) {
      onDelete(sessionId, message.id)
    }
  }

  const handleAnnotateMessage = () => {
    if (onAnnotate) {
      onAnnotate(sessionId, message.id)
    }
  }

  // Enhanced color palette for annotations with better contrast
  const getAnnotationColors = () => {
    const colors = [
      "bg-red-50 text-red-700 border-red-200",
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-green-50 text-green-700 border-green-200",
      "bg-yellow-50 text-yellow-700 border-yellow-200",
      "bg-purple-50 text-purple-700 border-purple-200",
      "bg-pink-50 text-pink-700 border-pink-200",
      "bg-indigo-50 text-indigo-700 border-indigo-200",
      "bg-orange-50 text-orange-700 border-orange-200",
      "bg-teal-50 text-teal-700 border-teal-200",
      "bg-cyan-50 text-cyan-700 border-cyan-200",
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-violet-50 text-violet-700 border-violet-200",
      "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      "bg-rose-50 text-rose-700 border-rose-200",
      "bg-amber-50 text-amber-700 border-amber-200",
      "bg-lime-50 text-lime-700 border-lime-200",
    ]
    return colors
  }

  // Function to properly extract tags from annotations
  const extractTags = (annotation: { tags: string[] }): string[] => {
    // According to the Annotation type, tags is always string[]
    return annotation.tags.filter(Boolean)
  }

  // Enhanced markdown rendering with better code block support
  const renderMarkdown = (content: string) => {
    try {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props: any) { // Cast props to any to bypass type checking
                const { node, inline, className, children, ...restProps } = props;
                const match = /language-(\w+)/.exec(className || "")
                const language = match ? match[1] : ""
                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`

                if (!inline && language) {
                  return (
                    <div className="relative group">
                      <div className="absolute top-2 right-2 transition-opacity z-10">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyCode(String(children).replace(/\n$/, ""), codeId)}
                          type="button"
                          className="h-7 m-1 px-2 text-xs"
                        >
                          {copiedStates[codeId] ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
            
                        <SyntaxHighlighter
                        language={language}
                        style={prism}
                        customStyle={{
                          fontSize: "13px",
                          lineHeight: "1.5",
                          margin: 0,
                          padding: "8px",
                          // background: "#282c34",
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>

                      
                    </div>
                  )
                } else {
                  return (
                    <code className="px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  )
                }
              },
              pre({ children }) {
                return <div className="not-prose">{children}</div>
              },
            }}
          >
            {content || ""}
          </ReactMarkdown>
        </div>
      )
    } catch (error: any) {
      console.error("Error rendering markdown:", error)
      return <div className="text-sm">{content || ""}</div>
    }
  }

  const isUser = message.role === "user"

  return (
    <div className={cn("group relative", isUser ? "bg-muted/30" : "bg-background")}>
      <div className="max-w-4xl mx-auto px-3 py-4">
        {/* Avatar and role at the top */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
              isUser ? "bg-primary text-primary-foreground" : "bg-blue-500 text-white",
            )}
          >
            {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{isUser ? "You" : "Assistant" + (message.metadata?.sender ? ` (${message.metadata?.sender})` : "")}</span>
          <span className="text-xs text-muted-foreground">
            {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Message content */}
        <div className="space-y-3 relative overflow-hidden">
          {message.content.map((content, index) => {
            if (content.type === "text") {
              return (
                <div key={index} className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                  {content.content || ""}
                </div>
              )
            } else if (content.type === "markdown") {
              return (
                <div key={index} className="text-sm">
                  {renderMarkdown(content.content || "")}
                </div>
              )
            } else if (content.type === "code") {
              const codeId = `code-${index}-${Math.random().toString(36).substr(2, 9)}`
              return (
                <div key={index} className="relative group not-prose">
                  <div className="absolute top-2 right-2 transition-opacity z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyCode(content.content || "", codeId)}
                      type="button"
                      className="h-7 px-2 text-xs"
                    >
                      {copiedStates[codeId] ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    language={content.language || "javascript"}
                    style={prism} // Use style prop directly
                    className="rounded-md"
                    customStyle={{
                      fontSize: "13px",
                      lineHeight: "1.5",
                      margin: 0,
                      padding: "8px",
                      // background: "#282c34",
                    }}
                  >
                    {content.content || ""}
                  </SyntaxHighlighter>
                </div>
              )
            } else if (content.type === "terminal") {
              const terminalId = `terminal-${index}-${Math.random().toString(36).substr(2, 9)}`
              return (
                <div key={index} className="relative">
                  <div className="absolute top-2 right-2 transition-opacity z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyCode(content.content || "", terminalId)}
                      type="button"
                      className="h-7 px-2 text-xs"
                    >
                      {copiedStates[terminalId] ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-black rounded-md p-3 font-mono text-xs text-green-400 overflow-x-auto">
                    {content.content.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              )
            } else if (content.type === "tool-call" && content.toolCall) {
              return (
                <div key={index}>
                  <ToolResult toolCall={content.toolCall} />
                </div>
              )
            } else if (content.type === "ui" && content.component) {
              return (
                <div key={index} className="my-3">
                  {content.component}
                </div>
              )
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
                )
              }
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <div className="bg-muted-foreground/20 p-1 rounded">
                    <span className="text-xs font-bold uppercase">{content.fileName?.split(".").pop() || "file"}</span>
                  </div>
                  <div>
                    <p className="text-xs">{content.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {content.fileSize ? `${Math.round(content.fileSize / 1024)} KB` : ""}
                    </p>
                  </div>
                </div>
              )
            }
            return null
          })}

          {/* Actions menu - moved to bottom right */}
          <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" type="button">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCopyMessage()}>
                  <Copy className="mr-2 h-3 w-3" />
                  <span className="text-xs">Copy</span>
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={() => handleDeleteMessage()}>
                    <Trash className="mr-2 h-3 w-3" />
                    <span className="text-xs">Delete</span>
                  </DropdownMenuItem>
                )}
                {onAnnotate && (
                  <DropdownMenuItem onClick={() => handleAnnotateMessage()}>
                    <Tag className="mr-2 h-3 w-3" />
                    <span className="text-xs">Annotate</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Annotations with varied colors */}
        {message.annotations && message.annotations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {message.annotations.flatMap((annotation, annotationIndex) => {
              const tags = extractTags(annotation)
              const colors = getAnnotationColors()
              return tags.map((tag, tagIndex) => {
                // Use a consistent color for each tag based on its content
                const colorIndex = (tag.charCodeAt(0) + tagIndex + annotationIndex) % colors.length
                const annotationColor = colors[colorIndex]
                return (
                  <Badge
                    key={`${annotationIndex}-${tagIndex}`}
                    variant="outline"
                    className={cn("text-xs border", annotationColor)}
                  >
                    {tag}
                  </Badge>
                )
              })
            })}
          </div>
        )}
      </div>
    </div>
  )
});
