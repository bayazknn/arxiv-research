"use client"
import { create } from 'zustand';
import { ArxivPaper } from '@/types/workspace';
import { set } from 'zod';

interface ArxivPaperStore {
    arxivPapers: ArxivPaper[];
    setArxivPapers: (arxivPapers: ArxivPaper[]) => void;
    selectArxivPaperByLink: (arxivPaperLink: string) => ArxivPaper | undefined;
    addArxivPaper: (arxivPaper: ArxivPaper) => void;
    removeArxivPaper: (arxivPaperId: string) => void;
}


export const useArxivPaperStore = create<ArxivPaperStore>((set, get) => ({
    arxivPapers: [],
    setArxivPapers: (arxivPapers: ArxivPaper[]) => set({ arxivPapers }),
    selectArxivPaperByLink: (arxivPaperLink: string): ArxivPaper | undefined => {
        const state = get();
        return state.arxivPapers.find((arxivPaper) => arxivPaper.link === arxivPaperLink);
    },
    addArxivPaper: (arxivPaper: ArxivPaper) => set((state) => ({ arxivPapers: [...state.arxivPapers, arxivPaper] })),
    removeArxivPaper: (arxivPaperId: string) => set((state) => ({ arxivPapers: state.arxivPapers.filter((arxivPaper) => arxivPaper.id !== arxivPaperId) })),
}));
