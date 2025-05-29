"use client";   
import { create } from 'zustand';
import { ArxivPaper } from '@/types/workspace';

interface ArxivPaperStore {
    arxivPapers: ArxivPaper[];
    setArxivPapers: (arxivPapers: ArxivPaper[]) => void;
    addArxivPaper: (arxivPaper: ArxivPaper) => void;
    removeArxivPaper: (arxivPaperId: string) => void;
}


export const useArxivPaperStore = create<ArxivPaperStore>((set) => ({
    arxivPapers: [],
    setArxivPapers: (arxivPapers: ArxivPaper[]) => set({ arxivPapers }),
    addArxivPaper: (arxivPaper: ArxivPaper) => set((state) => ({ arxivPapers: [...state.arxivPapers, arxivPaper] })),
    removeArxivPaper: (arxivPaperId: string) => set((state) => ({ arxivPapers: state.arxivPapers.filter((arxivPaper) => arxivPaper.id !== arxivPaperId) })),
}));
