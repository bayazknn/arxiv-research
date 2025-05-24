"use client";

import { ChatProvider } from "@/contexts/chat-context";
import { ChatMain } from "./chat-main";
import { ChatSession } from "@/types/chat";

interface ChatInterfaceProps {
  pdfUrl: string;
  onSendMessageToAi: (message: ChatSession, pdfUrl: string) => Promise<{ role: string; content: string }>;
}

export function ChatInterface({ pdfUrl, onSendMessageToAi }: ChatInterfaceProps) {
  return (
    <ChatProvider localStorageKey={pdfUrl}>
      <div className="flex flex-col h-full bg-background">
        <ChatMain pdfUrl={pdfUrl} onSendMessageToAi={onSendMessageToAi} />
      </div>
    </ChatProvider>
  );
}

// Make sure we have a default export as well
export default ChatInterface;
