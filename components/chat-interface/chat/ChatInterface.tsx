"use client";

import { useEffect } from "react";
import type { ChatSession, ChatMessage, Attachment } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { ChatMessagesArea } from "./ChatMessagesArea";
import { ChatInputArea } from "./ChatInputArea";
import { useChatSession } from "@/hooks/useChatSession";
import { useSearchParams } from "next/navigation";

interface ChatInterfaceProps {
  sessions: ChatSession[] | undefined;
  activeSession: ChatSession | undefined;
  onSendMessage: (sessionId: string, text: string, attachments: Attachment[]) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSession: (sessionId: string) => void;
}

export function ChatInterface() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    renameSession,
    deleteSession,
    exportSession,
    addMessage,
    getActiveSession,
  } = useChatSession();
  const activeSession = getActiveSession();
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get("link")?.replace("abs", "pdf");

  const sendAiMessage = async (messages: ChatMessage[]) => {
    console.log("message interfaces: ", messages);
    console.log("pdf url : ", pdfUrl);

    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages?.map((ms) => ({
          role: ms.role,
          content: ms.text,
        })),
        pdfUrl: pdfUrl,
      }),
    });
    const { role, text } = await response.json();
    console.log("ai message role: ", role);
    console.log("ai message text: ", text);
    return { role: role, text: text };
  };

  const handleSendMessage = async (messageText: string, attachments: Attachment[]) => {
    if (activeSession) {
      addMessage(activeSession.id, {
        role: "user",
        text: messageText,
        attachments,
        // displayType: messageText.startsWith("```") ? "code" : "markdown",
        displayType: "markdown",
      });
    }
  };

  useEffect(() => {
    if (activeSession && activeSession.messages.length > 0) {
      const lastMessage = activeSession.messages[activeSession.messages.length - 1];
      if (lastMessage.role === "user") {
        sendAiMessage(activeSession.messages).then(({ role, text }) => {
          addMessage(activeSession.id, {
            role: role,
            text: text,
            // displayType: text.startsWith("```") ? "code" : "markdown",
            displayType: "markdown",
          });
        });
      }
    }
  }, [activeSession?.messages, activeSession, addMessage, sendAiMessage]);

  const handleCreateSession = () => {
    const newSession = createSession();
    setActiveSessionId(newSession.id);
    return newSession;
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <ChatHeader
        sessions={sessions}
        session={activeSession}
        onCreateSession={handleCreateSession}
        onSetActiveSession={setActiveSessionId}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        onExportSession={exportSession}
      />
      <ChatMessagesArea messages={activeSession?.messages || []} />
      <ChatInputArea onSendMessage={handleSendMessage} />
    </div>
  );
}
