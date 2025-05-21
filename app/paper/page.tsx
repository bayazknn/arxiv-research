"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface/chat/ChatInterface";

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
  const arxivId = link ? link.split("/").pop() : "";
  const pdfUrl = link ? `https://arxiv.org/pdf/${arxivId}` : "";
  const [pdfText, setPdfText] = useState("");
  const [pdfPageNumber, setPdfPageNumber] = useState(0);

  useEffect(() => {
    async function getPdfInfo() {
      const response = await fetch("/api/extract-pdf-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: pdfUrl,
        }),
      });

      const { text, totalPages } = await response.json();
      setPdfText(text);
      setPdfPageNumber(totalPages);
    }

    getPdfInfo();
  }, [pdfUrl]);

  return (
    <div className="flex flex-row ml-3 m-2 gap-4">
      <div className="w-1/2 h-screen">
        <iframe src={pdfUrl} className="w-full h-full" title="arXiv PDF" allowFullScreen />
      </div>
      <div className="w-1/2 h-screen">
        <ChatInterface />
      </div>
    </div>
  );
}
