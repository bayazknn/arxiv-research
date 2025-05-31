import type React from "react"
export type MessageRole = "user" | "assistant" | "system" | "tool"

export type CodeBlockAction = "copy" | "run" | "save"

export type MessageAction = "copy" | "delete" | "annotate"

export type SessionAction = "rename" | "delete" | "export"

export type Annotation = {
  id: string
  text: string
  tags: string[]
  color?: string
  createdAt: Date
}

export type Attachment = {
  id: string
  name: string
  type: string
  size: number
  url: string
  content?: string
  previewUrl?: string
  isImage?: boolean
}

export type ToolCall = {
  id: string
  name: string
  args: Record<string, any>
  result?: any
  status: "pending" | "completed" | "error"
}

export type MessageContent = {
  type: "text" | "code" | "markdown" | "image" | "file" | "terminal" | "tool-call" | "tool-result" | "ui"
  content: string
  language?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  toolCall?: ToolCall
  component?: React.ReactNode
}

export type Message = {
  id: string
  role: MessageRole
  content: MessageContent[]
  createdAt: Date
  annotations: Annotation[]
  attachments?: Attachment[]
  toolCalls?: ToolCall[]
  metadata?:any| null
}

export type ChatSession = {
  id: string
  name: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  annotations: Annotation[]
  metadata?: Record<string, any> | null
}

export type PredefinedPrompt = {
  id: string
  title: string
  prompt: string
  category: string
}

export type AIProvider = "openai" | "anthropic" | "google" | "custom"

export type AIModel = {
  id: string
  name: string
  provider: AIProvider
}
