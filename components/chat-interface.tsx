"use client"

import { ChatProvider } from "@/contexts/chat-context"
import { ChatMain } from "./chat-main"

export function ChatInterface() {
  return (
    <ChatProvider>
      <div className="flex flex-col h-full bg-background">
        <ChatMain />
      </div>
    </ChatProvider>
  )
}

// Make sure we have a default export as well
export default ChatInterface
