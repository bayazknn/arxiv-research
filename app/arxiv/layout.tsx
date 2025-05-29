"use client";

import { QueryProvider } from '../providers';
import { ReactNode } from 'react';

export default function ArxivSearchLayout({children}: Readonly<{children: ReactNode}>) {
    return (<QueryProvider>
        {children}
      </QueryProvider>)
    
}