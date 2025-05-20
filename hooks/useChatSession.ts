"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ChatSession, ChatMessage, Attachment } from '@/types/chat';
import { generateId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'nebulaChatSessions';

export function useChatSession() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
        // Ensure all sessions have messages array
        const validatedSessions = parsedSessions.map(s => ({ ...s, messages: s.messages || [] }));
        setSessions(validatedSessions);
        if (validatedSessions.length > 0 && !activeSessionId) {
          setActiveSessionId(validatedSessions[0].id);
        } else if (validatedSessions.length === 0) {
           // Create a default session if none exist
           const newSession = createNewSession("Chat 1", true);
           setSessions([newSession]);
           setActiveSessionId(newSession.id);
        }
      } else {
        // Create a default session if no data in localStorage
        const newSession = createNewSession("Chat 1", true);
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    } catch (error) {
      console.error("Failed to load sessions from localStorage:", error);
      toast({ title: "Error", description: "Could not load chat sessions.", variant: "destructive" });
      // Initialize with a default session on error
      const newSession = createNewSession("Chat 1", true);
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load once on mount

  useEffect(() => {
    try {
      // Filter out temporary fileObjects and dataUrls before saving
      const sessionsToStore = sessions.map(session => ({
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          attachments: msg.attachments?.map(att => {
            const { fileObject, dataUrl, ...rest } = att;
            return rest;
          })
        }))
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToStore));
    } catch (error) {
      console.error("Failed to save sessions to localStorage:", error);
      toast({ title: "Error", description: "Could not save chat progress.", variant: "destructive" });
    }
  }, [sessions, toast]);
  
  const createNewSession = (name?: string, suppressToast?: boolean): ChatSession => {
    const newSession: ChatSession = {
      id: generateId(),
      name: name || `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (!suppressToast) {
     toast({ title: "Session Created", description: `New session "${newSession.name}" started.` });
    }
    return newSession;
  };


  const createSession = useCallback(() => {
    const newSession = createNewSession();
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    return newSession;
  }, [sessions.length, toast]);

  const renameSession = useCallback((sessionId: string, newName: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, name: newName, updatedAt: Date.now() } : session
      )
    );
    toast({ title: "Session Renamed", description: `Session updated to "${newName}".` });
  }, [toast]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const newSessions = prev.filter(session => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
      }
      if (newSessions.length === 0) { // If all sessions are deleted, create a new default one
        const newDefaultSession = createNewSession("Chat 1", true);
        setActiveSessionId(newDefaultSession.id);
        return [newDefaultSession];
      }
      return newSessions;
    });
    toast({ title: "Session Deleted", description: "The chat session has been removed." });
  }, [activeSessionId, toast]);

  const exportSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Filter out temporary fileObjects and dataUrls from export
      const sessionToExport = {
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          attachments: msg.attachments?.map(att => {
            const { fileObject, dataUrl, ...rest } = att;
            return rest;
          })
        }))
      };
      const json = JSON.stringify(sessionToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.name.replace(/\s+/g, '_')}_${new Date(session.createdAt).toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Session Exported", description: `"${session.name}" exported as JSON.` });
    }
  }, [sessions, toast]);

  const addMessage = useCallback((sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, newMessage], updatedAt: Date.now() }
          : session
      )
    );
    // Simulate assistant response
    if (message.role === 'user') {
        setTimeout(() => {
            const assistantResponse: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                text: `This is a mocked AI response to: "${message.text || 'your attachment'}".\n\nI can render **markdown**!\n\n\`\`\`javascript\nconsole.log("Hello, NebulaChat!");\n\`\`\`\n\nAnd also terminal commands:\n\n\`\`\`bash\nls -la\necho "Done"\n\`\`\`
                `,
                displayType: 'markdown',
                timestamp: Date.now(),
            };
             setSessions(prevSessions =>
                prevSessions.map(s =>
                    s.id === sessionId
                        ? { ...s, messages: [...s.messages, assistantResponse], updatedAt: Date.now() }
                        : s
                )
            );
        }, 1000);
    }


  }, []);

  const getActiveSession = useCallback((): ChatSession | undefined => {
    return sessions.find(session => session.id === activeSessionId);
  }, [sessions, activeSessionId]);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    renameSession,
    deleteSession,
    exportSession,
    addMessage,
    getActiveSession,
  };
}
