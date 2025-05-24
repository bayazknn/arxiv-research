"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatSession, Message, Annotation, MessageContent } from "@/types/chat";

type ChatContextType = {
  sessions: ChatSession[];
  currentSessionId: string | null;
  localStorageKey: string;
  createSession: (name?: string) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  exportSession: (id: string) => string;
  setCurrentSession: (id: string) => void;
  addMessage: (role: "user" | "assistant" | "system", content: MessageContent[]) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  annotateMessage: (sessionId: string, messageId: string, annotation: Omit<Annotation, "id" | "createdAt">) => void;
  annotateSession: (sessionId: string, annotation: Omit<Annotation, "id" | "createdAt">) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children, localStorageKey }: { children: React.ReactNode; localStorageKey: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(localStorageKey);
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        // Convert string dates back to Date objects
        parsedSessions.forEach((session: any) => {
          session.createdAt = new Date(session.createdAt);
          session.updatedAt = new Date(session.updatedAt);
          session.messages.forEach((message: any) => {
            message.createdAt = new Date(message.createdAt);
            if (message.annotations) {
              message.annotations.forEach((annotation: any) => {
                annotation.createdAt = new Date(annotation.createdAt);
              });
            }
          });
          if (session.annotations) {
            session.annotations.forEach((annotation: any) => {
              annotation.createdAt = new Date(annotation.createdAt);
            });
          }
        });
        setSessions(parsedSessions);

        // Set current session to the last one if it exists
        if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading sessions from localStorage:", error);
      // Initialize with empty sessions if there's an error
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      if (sessions.length > 0) {
        localStorage.setItem(localStorageKey, JSON.stringify(sessions));
      } else {
        // Clear localStorage if there are no sessions
        localStorage.removeItem(localStorageKey);
      }
    } catch (error) {
      console.error("Error saving sessions to localStorage:", error);
    }
  }, [sessions]);

  const createSession = (name = "New Chat") => {
    const id = uuidv4();
    const newSession: ChatSession = {
      id,
      name,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      annotations: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(id);
    return id;
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const updatedSessions = prev.filter((session) => session.id !== id);

      // Update localStorage immediately
      try {
        if (updatedSessions.length > 0) {
          localStorage.setItem(localStorageKey, JSON.stringify(updatedSessions));
        } else {
          localStorage.removeItem(localStorageKey);
        }
      } catch (error) {
        console.error("Error updating localStorage after session deletion:", error);
      }

      return updatedSessions;
    });

    // Update currentSessionId if the deleted session was the current one
    setCurrentSessionId((prevId) => {
      if (prevId === id) {
        return sessions.length > 1 ? sessions.find((s) => s.id !== id)?.id || null : null;
      }
      return prevId;
    });
  };

  const renameSession = (id: string, name: string) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === id ? { ...session, name, updatedAt: new Date() } : session))
    );
  };

  const exportSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return "";
    return JSON.stringify(session, null, 2);
  };

  const setCurrentSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const addMessage = (role: "user" | "assistant" | "system", content: MessageContent[]) => {
    if (!currentSessionId) {
      const newId = createSession();
      setCurrentSessionId(newId);
    }

    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      createdAt: new Date().toISOString(),
      annotations: [],
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: new Date(),
            }
          : session
      )
    );
  };

  const deleteMessage = (sessionId: string, messageId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: session.messages.filter((msg) => msg.id !== messageId),
              updatedAt: new Date(),
            }
          : session
      )
    );
  };

  // Helper function to normalize tags
  const normalizeTags = (tags: string[] | string): string[] => {
    if (Array.isArray(tags)) {
      return tags
        .flatMap((tag) => (typeof tag === "string" ? tag.split(",").map((t) => t.trim()) : tag))
        .filter(Boolean);
    }

    if (typeof tags === "string") {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    return [];
  };

  const annotateMessage = (sessionId: string, messageId: string, annotation: Omit<Annotation, "id" | "createdAt">) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: uuidv4(),
      createdAt: new Date(),
    };

    // Ensure tags is always a normalized array
    newAnnotation.tags = normalizeTags(newAnnotation.tags);

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;

        return {
          ...session,
          messages: session.messages.map((message) => {
            if (message.id !== messageId) return message;

            // Replace annotations instead of adding to them
            return {
              ...message,
              annotations: [newAnnotation],
            };
          }),
          updatedAt: new Date(),
        };
      })
    );
  };

  const annotateSession = (sessionId: string, annotation: Omit<Annotation, "id" | "createdAt">) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: uuidv4(),
      createdAt: new Date(),
    };

    // Ensure tags is always a normalized array
    newAnnotation.tags = normalizeTags(newAnnotation.tags);

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;

        // Replace annotations instead of adding to them
        return {
          ...session,
          annotations: [newAnnotation],
          updatedAt: new Date(),
        };
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSessionId,
        localStorageKey,
        createSession,
        deleteSession,
        renameSession,
        exportSession,
        setCurrentSession,
        addMessage,
        deleteMessage,
        annotateMessage,
        annotateSession,
      }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
