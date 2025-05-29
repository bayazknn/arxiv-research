"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';

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

export default function PaperPage() {
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
    <div className="flex flex-row ml-3 m-2 gap-4 h-screen overflow-hidden paper-page">
      {/* <div className="w-full h-screen relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        {iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 p-4 rounded-lg">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="text-lg font-semibold mb-2">Failed to load PDF</p>
            <p className="text-sm text-center">
              The PDF could not be loaded. This might be due to an invalid link or network issues.
            </p>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try opening the PDF directly
              </a>
            )}
          </div>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className={`w-full h-full ${iframeLoading || iframeError ? 'hidden' : ''}`}
            title="arXiv PDF"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
        {!pdfUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <p>No PDF link provided. Please provide a valid arXiv link.</p>
          </div>
        )}
      </div> */}

      <div className="w-full h-screen relative">
        <PdfViewer pdfUrl={pdfUrl}/>
      </div>


      <div className="h-screen bg-background">
        {/* <ChatInterface onSendMessageToAi={onSendMessageToAi} pdfUrl={pdfUrl} /> */}
      <ChatInterface></ChatInterface>
      </div>
    </div>
  );
}
