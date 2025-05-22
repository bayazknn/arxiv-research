export type MessageRole = "user" | "assistant" | "system"

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

export type MessageContent = {
  type: "text" | "code" | "markdown" | "image" | "file" | "terminal"
  content: string
  language?: string
  fileName?: string
  fileType?: string
  fileSize?: number
}

// export type Message = {
//   id: string
//   role: MessageRole
//   content: MessageContent[]
//   createdAt: Date
//   annotations: Annotation[]
//   attachments?: Attachment[]
// }

export interface Message {
  id: string;
  role: string;
  content: MessageContent[];
  createdAt: string;
  annotations: Annotation[]; // This is the required property we were missing
}

export type ChatSession = {
  id: string
  name: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  annotations: Annotation[]
}

export type PredefinedPrompt = {
  id: string
  title: string
  prompt: string
}
