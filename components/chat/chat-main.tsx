"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatMessage } from "./chat-message"
import { ChatInputArea } from "./chat-input-area"
import { PredefinedPrompts } from "./predefined-prompts"
import { TextSelectionPopup } from "./text-selection-popup"
import { PromptsDialog } from "./prompts-dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus, Edit, Trash, Download, Tag, MoreHorizontal, X, Bot } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { MessageContent, Attachment, Annotation } from "@/types/chat"
import { MessageSkeleton } from "./message-skeleton"
import  SessionsUpload  from "./sessions-upload"
import { useSearchParams } from "next/navigation"

export function ChatMain() {
  const searchParams = useSearchParams()
  const pdfUrl = searchParams.get("link")


  const {
    currentSessionId,
    sessions,
    addMessage,
    updateMessageContent, // Import the new function
    createSession,
    deleteSession,
    renameSession,
    exportSession,
    setCurrentSession,
    deleteMessage,
    annotateMessage,
    annotateSession,
  } = useChat()

  const [showPrompts, setShowPrompts] = useState(false)
  const [showPromptsDialog, setShowPromptsDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash-exp")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [quotedText, setQuotedText] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Session management state
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false)
  const [isMessageAnnotateOpen, setIsMessageAnnotateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [annotationText, setAnnotationText] = useState("")
  const [annotationTags, setAnnotationTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [sessionToModify, setSessionToModify] = useState<string | null>(null)
  const [messageToAnnotate, setMessageToAnnotate] = useState<{ sessionId: string; messageId: string } | null>(null)
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false)
  const [currentAnnotationId, setCurrentAnnotationId] = useState<string | null>(null)

  const currentSession = sessions.find((session) => session.id === currentSessionId)
  const isNewSession = currentSession?.messages.length === 0

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, isAiLoading])



  // Show prompts when starting a new session
  useEffect(() => {
    if (isNewSession && currentSession) {
      setShowPrompts(true)
    } else {
      setShowPrompts(false)
    }
  }, [isNewSession, currentSession])



  // Expanded color palette for annotations - each tag gets unique color
  const getUniqueRandomColor = useCallback(() => {
    const colors = [
      "bg-red-100 text-red-800 border-red-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-violet-100 text-violet-800 border-violet-200",
      "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-lime-100 text-lime-800 border-lime-200",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  // Function to extract tags from an annotation
  const extractTagsFromAnnotation = useCallback((annotation: Annotation): string[] => {
    // According to the Annotation type, tags is always string[]
    return annotation.tags.filter(Boolean)
  }, [])

  // Text selection handlers
  const handleTextCopy = useCallback((text: string) => {
    console.log("Copied text:", text)
  }, [])

  const handleTextQuote = useCallback((text: string) => {
    setQuotedText(text)
  }, [setQuotedText])

  const handleClearQuote = useCallback(() => {
    setQuotedText("")
  }, [setQuotedText])

  const handleTextAction1 = useCallback((text: string) => {
    console.log("Action 1 with text:", text)
    // Placeholder for future functionality
  }, [])

  const handleTextAction2 = useCallback((text: string) => {
    console.log("Action 2 with text:", text)
    // Placeholder for future functionality
  }, [])

  // Session management functions
  const handleCreateSession = useCallback(() => {
    createSession()
  }, [createSession])

  const handleOpenRename = useCallback((id: string, name: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setSessionToModify(id)
    setNewName(name)
    setIsRenameOpen(true)
  }, [setSessionToModify, setNewName, setIsRenameOpen])

  const handleCloseRename = useCallback(() => {
    setIsRenameOpen(false)
    setNewName("")
    setSessionToModify(null)
  }, [setIsRenameOpen, setNewName, setSessionToModify])

  const handleRenameSession = useCallback(() => {
    if (sessionToModify && newName.trim()) {
      renameSession(sessionToModify, newName)
      handleCloseRename()
    }
  }, [sessionToModify, newName, renameSession, handleCloseRename])

  const handleDeleteSession = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    deleteSession(id)
  }, [deleteSession])

  const handleExportSession = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const jsonData = exportSession(id)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-session-${id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportSession])

  const handleOpenAnnotate = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setAnnotationText("")
    setAnnotationTags([])
    setNewTag("")
    setIsEditingAnnotation(false)
    setCurrentAnnotationId(null)

    const session = sessions.find((s) => s.id === id)
    if (session && session.annotations && session.annotations.length > 0) {
      const latestAnnotation = session.annotations[session.annotations.length - 1]
      setAnnotationText(latestAnnotation.text || "")
      const extractedTags = extractTagsFromAnnotation(latestAnnotation)
      setAnnotationTags(extractedTags)
      setIsEditingAnnotation(true)
      setCurrentAnnotationId(latestAnnotation.id)
    }

    setSessionToModify(id)
    setIsAnnotateOpen(true)
  }, [sessions, extractTagsFromAnnotation, setAnnotationText, setAnnotationTags, setNewTag, setIsEditingAnnotation, setCurrentAnnotationId, setSessionToModify, setIsAnnotateOpen])

  const handleCloseAnnotate = useCallback(() => {
    setIsAnnotateOpen(false)
    setAnnotationText("")
    setAnnotationTags([])
    setNewTag("")
    setSessionToModify(null)
    setIsEditingAnnotation(false)
    setCurrentAnnotationId(null)
  }, [setIsAnnotateOpen, setAnnotationText, setAnnotationTags, setNewTag, setSessionToModify, setIsEditingAnnotation, setCurrentAnnotationId])

  const handleOpenMessageAnnotate = useCallback((sessionId: string, messageId: string) => {
    setAnnotationText("")
    setAnnotationTags([])
    setNewTag("")
    setIsEditingAnnotation(false)
    setCurrentAnnotationId(null)

    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      const message = session.messages.find((m) => m.id === messageId)
      if (message && message.annotations && message.annotations.length > 0) {
        const latestAnnotation = message.annotations[message.annotations.length - 1]
        setAnnotationText(latestAnnotation.text || "")
        const extractedTags = extractTagsFromAnnotation(latestAnnotation)
        setAnnotationTags(extractedTags)
        setIsEditingAnnotation(true)
        setCurrentAnnotationId(latestAnnotation.id)
      }
    }

    setMessageToAnnotate({ sessionId, messageId })
    setIsMessageAnnotateOpen(true)
  }, [sessions, extractTagsFromAnnotation, setAnnotationText, setAnnotationTags, setNewTag, setIsEditingAnnotation, setCurrentAnnotationId, setMessageToAnnotate, setIsMessageAnnotateOpen])

  const handleCloseMessageAnnotate = useCallback(() => {
    setIsMessageAnnotateOpen(false)
    setAnnotationText("")
    setAnnotationTags([])
    setNewTag("")
    setMessageToAnnotate(null)
    setIsEditingAnnotation(false)
    setCurrentAnnotationId(null)
  }, [setIsMessageAnnotateOpen, setAnnotationText, setAnnotationTags, setNewTag, setMessageToAnnotate, setIsEditingAnnotation, setCurrentAnnotationId])

  const handleSaveAnnotation = useCallback(() => {
    if (sessionToModify) {
      try {
        // Create tags with individual colors
        const tagsWithColors = annotationTags.filter(Boolean).map((tag) => ({
          text: tag,
          color: getUniqueRandomColor(),
        }))

        annotateSession(sessionToModify, {
          text: annotationText,
          tags: annotationTags.filter(Boolean),
          color: getUniqueRandomColor(),
        })
        handleCloseAnnotate()
      } catch (error) {
        console.error("Error saving session annotation:", error)
        handleCloseAnnotate()
      }
    }
  }, [sessionToModify, annotationTags, getUniqueRandomColor, annotateSession, annotationText, handleCloseAnnotate])

  const handleSaveMessageAnnotation = useCallback(() => {
    if (messageToAnnotate) {
      try {
        annotateMessage(messageToAnnotate.sessionId, messageToAnnotate.messageId, {
          text: annotationText,
          tags: annotationTags.filter(Boolean),
          color: getUniqueRandomColor(),
        })
        handleCloseMessageAnnotate()
      } catch (error) {
        console.error("Error saving message annotation:", error)
        handleCloseMessageAnnotate()
      }
    }
  }, [messageToAnnotate, annotationText, annotationTags, annotateMessage, getUniqueRandomColor, handleCloseMessageAnnotate])

  const handleAddTag = useCallback(() => {
    if (newTag.trim()) {
      setAnnotationTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }, [newTag, setAnnotationTags, setNewTag])

  const handleRemoveTag = useCallback((index: number) => {
    setAnnotationTags((prev) => prev.filter((_, i) => i !== index))
  }, [setAnnotationTags])

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }, [handleAddTag])


  const handleSendLanggraphMessage = useCallback(async (message: string, attachments: Attachment[]) => {
    if (!message.trim() && attachments.length === 0) return

    const parts: MessageContent[] = []

    if (message.trim()) {
      const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g
      let lastIndex = 0
      let match

      while ((match = codeBlockRegex.exec(message)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: message.slice(lastIndex, match.index),
          })
        }

        parts.push({
          type: "code",
          content: match[2],
          language: match[1] || "javascript",
        })

        lastIndex = match.index + match[0].length
      }

      if (lastIndex < message.length) {
        parts.push({
          type: "text",
          content: message.slice(lastIndex),
        })
      }

      if (parts.length === 0) {
        parts.push({
          type: "text",
          content: message,
        })
      }
    }

    attachments.forEach((attachment) => {
      parts.push({
        type: "file",
        content: attachment.url,
        fileName: attachment.name,
        fileType: attachment.type,
        fileSize: attachment.size,
      })
    })

    // Add user message to our session
    addMessage("user", parts)

    // Clear quoted text after sending
    setQuotedText("")

    // Set loading state
    setIsAiLoading(true)
    let aggAssistantResponse = "";
    let existingNode = "";
    let assistantMessageId = "";
    // Add an initial assistant message placeholder and get its ID
    // let assistantMessageId = addMessage("assistant", [{ type: "markdown", content: "" }], {"sender": "assistant"})
    try {
      // Send to AI API
      const eventSource = new EventSource(`http://localhost:8000/stream?arxiv_paper_url=https://arxiv.org/pdf/2505.03512v1.pdf`)


      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // const text = data.output || JSON.stringify(data, null, 2)
          console.log(data)
          const text = data.content
          const langgraph_node = data.langgraph_node

          if (currentSessionId) {

            if (existingNode !== langgraph_node) {
              existingNode = langgraph_node;
              aggAssistantResponse = "";
              aggAssistantResponse += text;
              assistantMessageId = addMessage("assistant", [{ type: "markdown", content: "" }], {"sender": langgraph_node})
              updateMessageContent(currentSessionId, assistantMessageId, aggAssistantResponse, {"sender": langgraph_node})  
            }
            aggAssistantResponse += text;
            updateMessageContent(currentSessionId, assistantMessageId, aggAssistantResponse, {"sender": langgraph_node});
          }
        } catch (e) {
          console.error("Error parsing SSE message:", e)
        }
      }
  
      eventSource.onerror = (err) => {
        console.error("SSE connection error:", err)
        eventSource.close()
      }

      eventSource.addEventListener("done", (e) => {
        console.log("Stream finished:", e.data)
        eventSource.close()
      })

      
      
      // Ensure loading state is reset after successful stream completion
      setIsAiLoading(false);

    } catch (error) {
      console.error("Error sending message:", error)

      // Fallback response on error
      const fallbackResponses = [
        "I apologize for the technical difficulty. I'm currently running in demo mode. Here's what I can help you with:\n\n• **Programming**: Code examples and explanations\n• **Mathematics**: Calculations and problem solving\n• **Research**: Information and analysis\n• **General questions**: Various topics and discussions\n\nWhat would you like to explore?",

        'I\'m experiencing some connectivity issues, but I can still assist you! Try asking me about:\n\n```python\n# Example: Python function\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n```\n\nI can help with code, math, research, and more. What interests you?',

        "Technical issues aside, I'm here to help! Here are some things I can demonstrate:\n\n## Capabilities\n- Code generation and review\n- Mathematical calculations\n- Research assistance\n- Problem solving\n- Explanations and tutorials\n\nWhat would you like to try?",
      ]

      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

      // Update the existing assistant message with the error fallback
      if (currentSessionId) {
        updateMessageContent(currentSessionId, assistantMessageId, randomFallback, {"sender": "assistant"});
      } else {
        // If somehow there's no current session, add a new message (less likely)
        addMessage("assistant", [{ type: "markdown", content: randomFallback }]);
      }

    } finally {
      setIsAiLoading(false)
    }
  }, [addMessage, updateMessageContent, setIsAiLoading])

  // Custom AI message handler
  const handleSendMessage = useCallback(async (message: string, attachments: Attachment[]) => {
    if (!message.trim() && attachments.length === 0) return

    const parts: MessageContent[] = []

    if (message.trim()) {
      const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g
      let lastIndex = 0
      let match

      while ((match = codeBlockRegex.exec(message)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: message.slice(lastIndex, match.index),
          })
        }

        parts.push({
          type: "code",
          content: match[2],
          language: match[1] || "javascript",
        })

        lastIndex = match.index + match[0].length
      }

      if (lastIndex < message.length) {
        parts.push({
          type: "text",
          content: message.slice(lastIndex),
        })
      }

      if (parts.length === 0) {
        parts.push({
          type: "text",
          content: message,
        })
      }
    }

    attachments.forEach((attachment) => {
      parts.push({
        type: "file",
        content: attachment.url,
        fileName: attachment.name,
        fileType: attachment.type,
        fileSize: attachment.size,
      })
    })

    // Add user message to our session
    addMessage("user", parts)

    // Clear quoted text after sending
    setQuotedText("")

    // Set loading state
    setIsAiLoading(true)

    // Add an initial assistant message placeholder and get its ID
    const assistantMessageId = addMessage("assistant", [{ type: "markdown", content: "" }])

    try {
      // Send to AI API
      const pdfContent = localStorage.getItem("pdf-content")
      console.log("pdf extracted in /chat route: ", pdfContent?.substring(0, 500) + '...')
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...(currentSession?.messages.map((msg) => ({
              role: msg.role,
              content: msg.content.map((c) => c.content).join("\n"),
            })) || []),
            {
              role: "user",
              content: message,
            },
          ],
          model: selectedModel,
          pdfUrl: pdfUrl,
          pdfContent: pdfContent
        }),
      })

      console.log("Chat API Response:", response)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
        
        if (currentSession) {
          // Update the assistant message with the error
          updateMessageContent(
            currentSession.id,
            assistantMessageId,
            `## Error
            
${errorMessage}

${errorData?.requiresApiKey ? 'Please add your Google Gemini API key to the .env file and restart the server.' : ''}`
          );
        } else {
          console.error('No active chat session found');
        }
        
        setIsAiLoading(false);
        return;
      }

      // Handle streaming response (plain text from Vercel AI SDK)
      const reader = response.body?.getReader();
      if (!reader) {
        // The main catch block below will handle updating the UI with an error message.
        throw new Error("Response body reader is not available.");
      }

      const decoder = new TextDecoder();
      let accumulatedAssistantResponse = ""; // Stores the full response as it streams in

      // The assistant message was added with empty content: addMessage("assistant", [{ type: "markdown", content: "" }])
      // So, accumulatedAssistantResponse starts empty and builds up the message.

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Stream finished successfully.
          break;
        }

        const textChunk = decoder.decode(value, { stream: true }); // Use { stream: true } for proper multi-byte character decoding
        // accumulatedAssistantResponse += textChunk;

        if (currentSessionId) {
          // Update the assistant's message with the entire accumulated content so far.
          // The ChatMessage component should then render this markdown content.
          updateMessageContent(currentSessionId, assistantMessageId, textChunk);
        }
      }
      // Ensure loading state is reset after successful stream completion
      setIsAiLoading(false);

    } catch (error) {
      console.error("Error sending message:", error)

      // Fallback response on error
      const fallbackResponses = [
        "I apologize for the technical difficulty. I'm currently running in demo mode. Here's what I can help you with:\n\n• **Programming**: Code examples and explanations\n• **Mathematics**: Calculations and problem solving\n• **Research**: Information and analysis\n• **General questions**: Various topics and discussions\n\nWhat would you like to explore?",

        'I\'m experiencing some connectivity issues, but I can still assist you! Try asking me about:\n\n```python\n# Example: Python function\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n```\n\nI can help with code, math, research, and more. What interests you?',

        "Technical issues aside, I'm here to help! Here are some things I can demonstrate:\n\n## Capabilities\n- Code generation and review\n- Mathematical calculations\n- Research assistance\n- Problem solving\n- Explanations and tutorials\n\nWhat would you like to try?",
      ]

      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

      // Update the existing assistant message with the error fallback
      if (currentSessionId) {
        updateMessageContent(currentSessionId, assistantMessageId, randomFallback);
      } else {
        // If somehow there's no current session, add a new message (less likely)
        addMessage("assistant", [{ type: "markdown", content: randomFallback }]);
      }

    } finally {
      setIsAiLoading(false)
    }
  }, [addMessage, updateMessageContent, setIsAiLoading])


  const handleSelectPrompt = useCallback((prompt: string) => {
    handleSendMessage(prompt, [])
    setShowPrompts(false)
    setShowPromptsDialog(false)
  }, [handleSendMessage, setShowPrompts, setShowPromptsDialog])

  // Function to handle message deletion
  const handleDeleteMessageClick = useCallback((sessionId: string, messageId: string) => {
    try {
      deleteMessage(sessionId, messageId)
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }, [deleteMessage])

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground mb-4">No chat session selected</p>
        <Button onClick={() => createSession()} className="text-sm">
          Start New Chat
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Text Selection Popup */}
      <TextSelectionPopup
        onCopy={handleTextCopy}
        onQuote={handleTextQuote}
        onAction1={handleTextAction1}
        onAction2={handleTextAction2}
      />

      {/* Prompts Dialog */}
      <PromptsDialog open={showPromptsDialog} onOpenChange={setShowPromptsDialog} onSelectPrompt={handleSelectPrompt} />

      {/* Header with session selector and model selector */}
      <div className="border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between text-sm h-8">
                {currentSession ? currentSession.name : "Select Session"}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              {sessions.map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  onSelect={() => setCurrentSession(session.id)}
                  className="flex flex-col items-start text-xs"
                >
                  <div className="flex w-full justify-between items-center">
                    <span className="truncate">{session.name}</span>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => handleOpenRename(session.id, session.name, e)}
                        type="button"
                      >
                        <Edit className="h-2 w-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        type="button"
                      >
                        <Trash className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                  {session.annotations && session.annotations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.annotations.flatMap((annotation, annotationIndex) => {
                        const tags = extractTagsFromAnnotation(annotation)
                        return tags.map((tag, tagIndex) => (
                          <Badge
                            key={`${annotationIndex}-${tagIndex}`}
                            variant="outline"
                            className={cn("text-xs", getUniqueRandomColor())}
                          >
                            {tag}
                          </Badge>
                        ))
                      })}
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleCreateSession}>
                <Plus className="mr-2 h-3 w-3" />
                <span className="text-xs">New Session</span>
              </DropdownMenuItem>
              {currentSession && (
                <>
                  <DropdownMenuItem
                    onSelect={() => {
                      if (currentSession) {
                        handleExportSession(currentSession.id)
                      }
                    }}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    <span className="text-xs">Export Session</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      if (currentSession) {
                        handleOpenAnnotate(currentSession.id)
                      }
                    }}
                  >
                    <Tag className="mr-2 h-3 w-3" />
                    <span className="text-xs">Annotate Session</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => handleCreateSession()} size="icon" variant="outline" type="button" className="h-8 w-8">
            <Plus className="h-3 w-3" />
          </Button>
          <SessionsUpload />
          <Button onClick={() => handleSendLanggraphMessage("auto message from user", [])} size="icon" variant="outline" type="button" className="h-8 w-8">
            <Bot/>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
              <SelectItem value="claude-3-5-haiku">Claude 3.5 Haiku</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setShowPromptsDialog(true)}>
                <span className="text-xs">Show Prompts</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {showPrompts && isNewSession ? (
          <div className="py-6">
            <h2 className="text-lg font-semibold text-center mb-4">How can I help you today?</h2>
            <PredefinedPrompts onSelectPrompt={handleSelectPrompt}/>
          </div>
        ) : (
          <>
            {currentSession.messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                sessionId={currentSession.id}
                onDelete={handleDeleteMessageClick}
                onAnnotate={handleOpenMessageAnnotate}
              />
            ))}
            {isAiLoading && <MessageSkeleton />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInputArea
        onSendMessage={handleSendMessage}
        placeholder="Message Arxiv Research..."
        disabled={isAiLoading}
        quotedText={quotedText}
        onClearQuote={handleClearQuote}
      />

      {/* All dialog components remain the same but with updated colors */}
      {isRenameOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleCloseRename}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Rename Session</h3>
              <Button variant="ghost" size="sm" onClick={handleCloseRename} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>

            <div className="py-3">
              <Label htmlFor="session-name" className="text-xs">
                Session Name
              </Label>
              <Input
                id="session-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 text-sm h-8"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseRename} type="button" className="text-xs h-7">
                Cancel
              </Button>
              <Button onClick={handleRenameSession} type="button" className="text-xs h-7">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session Annotate Dialog */}
      {isAnnotateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleCloseAnnotate}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">
                {isEditingAnnotation ? "Edit Session Annotation" : "Add Session Annotation"}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseAnnotate} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>

            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label htmlFor="session-annotation" className="text-xs">
                  Annotation
                </Label>
                <Textarea
                  id="session-annotation"
                  placeholder="Add your notes here..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tags</Label>

                <div className="flex flex-wrap gap-1 mb-2">
                  {annotationTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={cn("flex items-center gap-1 px-2 py-1 text-xs", getUniqueRandomColor())}
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTag(index)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 text-sm h-7"
                  />
                  <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()} className="text-xs h-7">
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCloseAnnotate} type="button" className="text-xs h-7">
                Cancel
              </Button>
              <Button onClick={handleSaveAnnotation} type="button" className="text-xs h-7">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Annotate Dialog */}
      {isMessageAnnotateOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleCloseMessageAnnotate}
        >
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">
                {isEditingAnnotation ? "Edit Message Annotation" : "Add Message Annotation"}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseMessageAnnotate} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>

            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label htmlFor="message-annotation" className="text-xs">
                  Annotation
                </Label>
                <Textarea
                  id="message-annotation"
                  placeholder="Add your notes here..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tags</Label>

                <div className="flex flex-wrap gap-1 mb-2">
                  {annotationTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={cn("flex items-center gap-1 px-2 py-1 text-xs", getUniqueRandomColor())}
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTag(index)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 text-sm h-7"
                  />
                  <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()} className="text-xs h-7">
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCloseMessageAnnotate} type="button" className="text-xs h-7">
                Cancel
              </Button>
              <Button onClick={handleSaveMessageAnnotation} type="button" className="text-xs h-7">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
