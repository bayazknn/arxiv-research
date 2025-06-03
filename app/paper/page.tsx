"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { useChatStore } from "@/lib/chat-store";

// Dynamically import the ChatInterface with SSR disabled
const ChatInterface = dynamic(
  () => import('@/components/chat/chat-interface'),
  { ssr: false }
);

// Dynamically import the PdfViewer with SSR disabled
const PdfViewer = dynamic(
  () => import('@/components/pdf-viewer'),
  { ssr: false }
);

import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { ChatSession } from "@/types/chat";
import { ChatMain } from "@/components/chat/chat-main";
import { ChatProvider } from "@/contexts/chat-context";

export default function PaperPage() {
  const {arxivPaper} = useChatStore();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaperPageContent />
    </Suspense>
  );
}

function PaperPageContent() {
  const searchParams = useSearchParams();
  const link = searchParams.get("link");
  
  // Extract the arXiv ID from the URL (handles both /abs/ and /pdf/ URLs)
  const getArxivId = (url: string | null): string => {
    if (!url) return '';
    // Handle different arXiv URL formats
    const absMatch = url.match(/arxiv\.org\/abs\/([^\/]+)/);
    if (absMatch) return absMatch[1];
    const pdfMatch = url.match(/arxiv\.org\/pdf\/([^\/]+)\.pdf/);
    if (pdfMatch) return pdfMatch[1];
    return url.split('/').pop() || '';
  };

  const arxivId = link ? getArxivId(link) : '';
  const pdfUrl = arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : '';

  console.log("match expression pdf url", pdfUrl)
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (pdfUrl) {
      setIframeLoading(true);
      setIframeError(false);
    }
  }, [pdfUrl]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
    console.error("Failed to load PDF in iframe:", pdfUrl);
  }, [pdfUrl]);

  const onSendMessageToAi = async (session: ChatSession, pdfUrl: string) => {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfUrl: pdfUrl,
        session: session,
      }),
    });

    return await response
      .json()
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error("Error sending message to AI:", err);
        return null;
      });
  };

  return (
    <>
    <div className="flex flex-col pt-2 h-screen">
      <div className="flex flex-row overflow-hidden">
        <div className="w-7/12 h-full relative m-2 overflow-hidden">
          <PdfViewer pdfUrl={pdfUrl} />
        </div>
        <div className="w-5/12 h-full bg-background">
          <div className="h-full overflow-y-auto pr-4">
                <ChatInterface />
          </div>
        </div>
      </div>
      <div className="flex w-full h-[20px]">
        .....
      </div>
    </div>

    </>

  );
}
