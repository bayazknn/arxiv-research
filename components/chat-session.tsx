"use client"

import type React from "react"

import { useChat } from "@/contexts/chat-context"
import { ChatMessage } from "./chat-message"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { MessageContent } from "@/types/chat"

export function ChatSession() {
  const { currentSessionId, sessions, addMessage, createSession } = useChat()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentSession = sessions.find((session) => session.id === currentSessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Simple detection for code blocks (text between \`\`\`)
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g
    const parts: MessageContent[] = []
    let lastIndex = 0
    let match

    // Extract code blocks and regular text
    while ((match = codeBlockRegex.exec(inputValue)) !== null) {
      // Add text before code block if any
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: inputValue.slice(lastIndex, match.index),
        })
      }

      // Add code block
      parts.push({
        type: "code",
        content: match[2],
        language: match[1] || "javascript",
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text if any
    if (lastIndex < inputValue.length) {
      parts.push({
        type: "text",
        content: inputValue.slice(lastIndex),
      })
    }

    // If no code blocks were found, treat the entire input as text
    if (parts.length === 0) {
      parts.push({
        type: "text",
        content: inputValue,
      })
    }

    addMessage("user", parts)
    setInputValue("")

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      addMessage("assistant", [
        {
          type: "markdown",
          content: "This is a simulated response from the AI assistant.",
        },
      ])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground mb-4">No chat session selected</p>
        <Button onClick={() => createSession()} type="button">
          Start New Chat
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {currentSession.messages.map((message) => (
          <ChatMessage key={message.id} message={message} sessionId={currentSession.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px]"
            onKeyDown={handleKeyDown}
          />
          <Button onClick={() => handleSendMessage()} className="self-end" type="button">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
