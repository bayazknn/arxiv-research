"use client";

import type { ChatMessage } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageItem } from "./ChatMessageItem";
import { useEffect, useRef } from "react";

interface ChatMessagesAreaProps {
  messages: ChatMessage[];
}

export function ChatMessagesArea({ messages }: ChatMessagesAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div ref={viewportRef} className="h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle-heart mb-4">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              <path d="M15.81 11.99A4.002 4.002 0 0 1 12.2 17a4 4 0 0 1-5.66-2.42" />
            </svg>
            <p className="text-lg">Welcome to NebulaChat!</p>
            <p>Send a message to start your conversation.</p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
        )}
      </div>
    </ScrollArea>
  );
}
