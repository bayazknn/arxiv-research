"use client";

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/chat-context";
import { ChatMessage } from "./chat-message";
import { ChatInputArea } from "./chat-input-area";
import { PredefinedPrompts } from "./predefined-prompts";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Edit, Trash, Download, Tag, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageContent, Attachment, Annotation } from "@/types/chat";

// Import the MessageSkeleton component
import { MessageSkeleton } from "./message-skeleton";

export function ChatMain() {
  // Destructure ALL available functions from useChat
  const {
    currentSessionId,
    sessions,
    addMessage,
    createSession,
    deleteSession,
    renameSession,
    exportSession,
    setCurrentSession,
    deleteMessage,
    annotateMessage,
    annotateSession,
  } = useChat();

  const [showPrompts, setShowPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session management state
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false);
  const [isMessageAnnotateOpen, setIsMessageAnnotateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [annotationText, setAnnotationText] = useState("");
  const [annotationTags, setAnnotationTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [sessionToModify, setSessionToModify] = useState<string | null>(null);
  const [messageToAnnotate, setMessageToAnnotate] = useState<{ sessionId: string; messageId: string } | null>(null);
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [currentAnnotationId, setCurrentAnnotationId] = useState<string | null>(null);

  // Add a new state for loading
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentSession = sessions.find((session) => session.id === currentSessionId);
  const isNewSession = currentSession?.messages.length === 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Show prompts when starting a new session
  useEffect(() => {
    if (isNewSession && currentSession) {
      setShowPrompts(true);
    } else {
      setShowPrompts(false);
    }
  }, [isNewSession, currentSession]);

  // Function to extract tags from an annotation
  const extractTagsFromAnnotation = (annotation: Annotation): string[] => {
    if (!annotation.tags) return [];

    if (Array.isArray(annotation.tags)) {
      // If it's already an array, flatten any comma-separated values
      return annotation.tags
        .flatMap((tag) => (typeof tag === "string" ? tag.split(",").map((t) => t.trim()) : tag))
        .filter(Boolean);
    }

    // If it's a string, split by commas
    if (annotation.tags) {
      if (typeof annotation.tags === "string") {
        return (annotation.tags as string)
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  // Session management functions
  const handleCreateSession = () => {
    createSession();
  };

  const handleOpenRename = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSessionToModify(id);
    setNewName(name);
    setIsRenameOpen(true);
  };

  const handleCloseRename = () => {
    setIsRenameOpen(false);
    setNewName("");
    setSessionToModify(null);
  };

  const handleRenameSession = () => {
    if (sessionToModify && newName.trim()) {
      renameSession(sessionToModify, newName);
      handleCloseRename();
    }
  };

  const handleDeleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    deleteSession(id);
  };

  const handleExportSession = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const jsonData = exportSession(id);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-session-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenAnnotate = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Reset annotation state
    setAnnotationText("");
    setAnnotationTags([]);
    setNewTag("");
    setIsEditingAnnotation(false);
    setCurrentAnnotationId(null);

    // Find the session
    const session = sessions.find((s) => s.id === id);
    if (session && session.annotations && session.annotations.length > 0) {
      // Use the most recent annotation
      const latestAnnotation = session.annotations[session.annotations.length - 1];
      setAnnotationText(latestAnnotation.text || "");

      // Extract tags properly
      const extractedTags = extractTagsFromAnnotation(latestAnnotation);
      setAnnotationTags(extractedTags);

      // Set editing state
      setIsEditingAnnotation(true);
      setCurrentAnnotationId(latestAnnotation.id);
    }

    setSessionToModify(id);
    setIsAnnotateOpen(true);
  };

  const handleCloseAnnotate = () => {
    setIsAnnotateOpen(false);
    setAnnotationText("");
    setAnnotationTags([]);
    setNewTag("");
    setSessionToModify(null);
    setIsEditingAnnotation(false);
    setCurrentAnnotationId(null);
  };

  // Function to open message annotation dialog
  const handleOpenMessageAnnotate = (sessionId: string, messageId: string) => {
    // Reset annotation state
    setAnnotationText("");
    setAnnotationTags([]);
    setNewTag("");
    setIsEditingAnnotation(false);
    setCurrentAnnotationId(null);

    // Find the session and message
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      const message = session.messages.find((m) => m.id === messageId);
      if (message && message.annotations && message.annotations.length > 0) {
        // Use the most recent annotation
        const latestAnnotation = message.annotations[message.annotations.length - 1];
        setAnnotationText(latestAnnotation.text || "");

        // Extract tags properly
        const extractedTags = extractTagsFromAnnotation(latestAnnotation);
        setAnnotationTags(extractedTags);

        // Set editing state
        setIsEditingAnnotation(true);
        setCurrentAnnotationId(latestAnnotation.id);
      }
    }

    setMessageToAnnotate({ sessionId, messageId });
    setIsMessageAnnotateOpen(true);
  };

  // Function to close message annotation dialog
  const handleCloseMessageAnnotate = () => {
    setIsMessageAnnotateOpen(false);
    setAnnotationText("");
    setAnnotationTags([]);
    setNewTag("");
    setMessageToAnnotate(null);
    setIsEditingAnnotation(false);
    setCurrentAnnotationId(null);
  };

  const handleSaveAnnotation = () => {
    if (sessionToModify) {
      try {
        // Always create a new annotation instead of updating
        annotateSession(sessionToModify, {
          text: annotationText,
          tags: annotationTags.filter(Boolean), // Filter out empty strings
          color: getRandomColor(),
        });
        handleCloseAnnotate();
      } catch (error) {
        console.error("Error saving session annotation:", error);
        handleCloseAnnotate();
      }
    }
  };

  // Function to save message annotations
  const handleSaveMessageAnnotation = () => {
    if (messageToAnnotate) {
      try {
        // Always create a new annotation instead of updating
        annotateMessage(messageToAnnotate.sessionId, messageToAnnotate.messageId, {
          text: annotationText,
          tags: annotationTags.filter(Boolean), // Filter out empty strings
          color: getRandomColor(),
        });
        handleCloseMessageAnnotate();
      } catch (error) {
        console.error("Error saving message annotation:", error);
        handleCloseMessageAnnotate();
      }
    }
  };

  // Function to add a new tag
  const handleAddTag = () => {
    if (newTag.trim()) {
      setAnnotationTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  // Function to remove a tag
  const handleRemoveTag = (index: number) => {
    setAnnotationTags((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle key press in the tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

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

  // Update the handleSendMessage function to show loading state
  const handleSendMessage = (message: string, attachments: Attachment[]) => {
    if (!message.trim() && attachments.length === 0) return;

    const parts: MessageContent[] = [];

    // Add text content if any
    if (message.trim()) {
      // Simple detection for code blocks (text between \`\`\`)
      const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;

      // Extract code blocks and regular text
      while ((match = codeBlockRegex.exec(message)) !== null) {
        // Add text before code block if any
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: message.slice(lastIndex, match.index),
          });
        }

        // Add code block
        parts.push({
          type: "code",
          content: match[2],
          language: match[1] || "javascript",
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text if any
      if (lastIndex < message.length) {
        parts.push({
          type: "text",
          content: message.slice(lastIndex),
        });
      }

      // If no code blocks were found, treat the entire input as text
      if (parts.length === 0) {
        parts.push({
          type: "text",
          content: message,
        });
      }
    }

    // Add file contents if any
    attachments.forEach((attachment) => {
      parts.push({
        type: "file",
        content: attachment.url,
        fileName: attachment.name,
        fileType: attachment.type,
        fileSize: attachment.size,
      });
    });

    try {
      addMessage("user", parts);

      // Show loading state
      setIsAiLoading(true);

      // Simulate AI response with various content types
      setTimeout(() => {
        addMessage("assistant", [
          {
            type: "markdown",
            content:
              "# Here's a sample response\n\nThis is a simulated response from the AI assistant that includes **markdown formatting**, code blocks, and terminal output.\n\nLet me demonstrate how different content types are rendered:",
          },
          {
            type: "code",
            content:
              "function calculateFactorial(n) {\n  if (n === 0 || n === 1) {\n    return 1;\n  }\n  return n * calculateFactorial(n - 1);\n}\n\nconsole.log(calculateFactorial(5)); // 120",
            language: "javascript",
          },
          {
            type: "markdown",
            content:
              "The above function calculates the factorial of a number recursively. Here's how you might use it in a React component:",
          },
          {
            type: "code",
            content:
              "import React, { useState } from 'react';\n\nexport default function FactorialCalculator() {\n  const [number, setNumber] = useState(5);\n  \n  const calculateFactorial = (n) => {\n    if (n === 0 || n === 1) return 1;\n    return n * calculateFactorial(n - 1);\n  };\n\n  return (\n    <div>\n      <input\n        type=\"number\"\n        value={number}\n        onChange={(e) => setNumber(parseInt(e.target.value))}\n      />\n      <p>Factorial: {calculateFactorial(number)}</p>\n    </div>\n  );\n}",
            language: "jsx",
          },
          {
            type: "terminal",
            content:
              "$ npm install factorial-calculator\n> factorial-calculator@1.0.0 install\n> Building packages...\n\nAdded 42 packages in 3.2s\n$ node calculate.js\nFactorial of 5: 120\n",
          },
          {
            type: "markdown",
            content:
              "I hope this demonstrates how different content types are rendered in the chat interface. Let me know if you have any questions!",
          },
        ]);

        // Hide loading state
        setIsAiLoading(false);
      }, 3000); // Increased delay to 3 seconds to better demonstrate the skeleton
    } catch (error) {
      console.error("Error sending message:", error);
      setIsAiLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    // When a prompt is selected, we'll send it directly
    handleSendMessage(prompt, []);
    setShowPrompts(false);
  };

  // Function to handle message deletion
  const handleDeleteMessageClick = (sessionId: string, messageId: string) => {
    try {
      deleteMessage(sessionId, messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground mb-4">No chat session selected</p>
        <Button onClick={() => createSession()}>Start New Chat</Button>
      </div>
    );
  }

  // Update the Messages area to include the skeleton when loading
  return (
    <div className="flex flex-col h-full">
      {/* Header with session selector */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                {currentSession ? currentSession.name : "Select Session"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {sessions.map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  onSelect={() => setCurrentSession(session.id)}
                  className="flex flex-col items-start">
                  <div className="flex w-full justify-between items-center">
                    <span className="truncate">{session.name}</span>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleOpenRename(session.id, session.name, e)}
                        type="button">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        type="button">
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {session.annotations && session.annotations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.annotations.flatMap((annotation, annotationIndex) => {
                        const tags = extractTagsFromAnnotation(annotation);
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
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleCreateSession}>
                <Plus className="mr-2 h-4 w-4" />
                New Session
              </DropdownMenuItem>
              {currentSession && (
                <>
                  <DropdownMenuItem
                    onSelect={() => {
                      if (currentSession) {
                        handleExportSession(currentSession.id);
                      }
                    }}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Session
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      if (currentSession) {
                        handleOpenAnnotate(currentSession.id);
                      }
                    }}>
                    <Tag className="mr-2 h-4 w-4" />
                    Annotate Session
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => handleCreateSession()} size="icon" variant="outline" type="button">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setShowPrompts(true)}>Show Prompts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {showPrompts && isNewSession ? (
          <div className="py-8">
            <h2 className="text-xl font-semibold text-center mb-6">How can I help you today?</h2>
            <PredefinedPrompts onSelectPrompt={handleSelectPrompt} />
          </div>
        ) : (
          <>
            {currentSession.messages.map((message) => (
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

      {/* Input area - using ChatInputArea component */}
      <ChatInputArea onSendMessage={handleSendMessage} placeholder="Message Arxiv Research..." disabled={false} />

      {/* Custom Rename Dialog */}
      {isRenameOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleCloseRename}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rename Session</h3>
              <Button variant="ghost" size="sm" onClick={handleCloseRename}>
                ×
              </Button>
            </div>

            <div className="py-4">
              <Label htmlFor="session-name">Session Name</Label>
              <Input id="session-name" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-2" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseRename} type="button">
                Cancel
              </Button>
              <Button onClick={handleRenameSession} type="button">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Session Annotate Dialog */}
      {isAnnotateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleCloseAnnotate}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditingAnnotation ? "Edit Session Annotation" : "Add Session Annotation"}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseAnnotate}>
                ×
              </Button>
            </div>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session-annotation">Annotation</Label>
                <Textarea
                  id="session-annotation"
                  placeholder="Add your notes here..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>

                {/* Display existing tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {annotationTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTag(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {/* Add new tag input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCloseAnnotate} type="button">
                Cancel
              </Button>
              <Button onClick={handleSaveAnnotation} type="button">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Message Annotate Dialog */}
      {isMessageAnnotateOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleCloseMessageAnnotate}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditingAnnotation ? "Edit Message Annotation" : "Add Message Annotation"}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseMessageAnnotate}>
                ×
              </Button>
            </div>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="message-annotation">Annotation</Label>
                <Textarea
                  id="message-annotation"
                  placeholder="Add your notes here..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>

                {/* Display existing tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {annotationTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTag(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {/* Add new tag input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCloseMessageAnnotate} type="button">
                Cancel
              </Button>
              <Button onClick={handleSaveMessageAnnotation} type="button">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
