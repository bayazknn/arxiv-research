"use client"
import { create } from 'zustand';
import { ArxivPaper } from '@/types/workspace';
import { set } from 'zod';
import { ChatSession } from '@/types/chat';

interface ChatStore {
    chatSessions: ChatSession[];
    arxivPaper: ArxivPaper;
    setArxivPaper: (arxivPaper: ArxivPaper) => void;
    getArxivPaper: () => ArxivPaper;
    getChatSessions: () => ChatSession[];
    setChatSessions: (chatSessions: ChatSession[]) => void;
    addChatSession: (chatSession: ChatSession) => void;
    removeChatSession: (chatSessionId: string) => void;
    selectChatSession: (chatSessionId: string) => ChatSession | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    chatSessions: [],
    arxivPaper: {
        id: '',
        title: '',
        authors: '',
        summary: '',
        link: '',
        published: '',
        categories: '',
        primary_category: '',
        workspace_id: '',
        text: '',
    },
    setArxivPaper: (arxivPaper: ArxivPaper) => set({ arxivPaper }),
    getArxivPaper: () => get().arxivPaper,
    getChatSessions: () => get().chatSessions,
    setChatSessions: (chatSessions: ChatSession[]) => set({ chatSessions }),
    addChatSession: (chatSession: ChatSession) => set((state) => ({ chatSessions: [...state.chatSessions, chatSession] })),
    removeChatSession: (chatSessionId: string) => set((state) => ({ chatSessions: state.chatSessions.filter((chatSession) => chatSession.id !== chatSessionId) })),
    selectChatSession: (chatSessionId: string) => get().chatSessions.find((chatSession) => chatSession.id === chatSessionId),
}));

    
    
    


