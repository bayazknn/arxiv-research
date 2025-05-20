"use client";

import type { ChatSession, ChatMessage, Attachment } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { ChatMessagesArea } from "./ChatMessagesArea";
import { ChatInputArea } from "./ChatInputArea";
import { useChatSession } from "@/hooks/useChatSession";

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

  const handleSendMessage = (text: string, attachments: Attachment[]) => {
    if (activeSession) {
      // onSendMessage(activeSession.id, text, attachments);
      addMessage(activeSession.id, {
        role: "user",
        text,
        attachments,
        displayType: text.startsWith("```") ? "code" : "markdown",
      });
    }
  };

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
