export type MessageRole = 'user' | 'assistant';

export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  fileObject?: File; // For active use, not persisted in JSON export
  dataUrl?: string; // For image previews, not persisted in JSON export
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text?: string; // Main text content
  attachments?: Attachment[]; // Files attached by user or potentially by assistant
  
  // Properties for rich display by assistant or user input that needs specific rendering
  displayType?: 'markdown' | 'code' | 'terminal'; 
  codeLanguage?: string; // e.g., 'javascript', 'python', 'bash'
  
  timestamp: number;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
