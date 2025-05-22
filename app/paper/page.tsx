"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
// import { ChatInterface } from "@/components/chat-interface/chat/ChatInterface";
import { ChatInterface } from "@/components/chat-interface";
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
  const arxivId = link ? link.split("/").pop() : "";
  const pdfUrl = link ? `https://arxiv.org/pdf/${arxivId}` : "";
  const [pdfText, setPdfText] = useState("");
  const [pdfPageNumber, setPdfPageNumber] = useState(0);

  const getPdfInfo = async () => {
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
  };

  useEffect(() => {
    getPdfInfo();
  }, []);

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
        console.log(`response returned from local api: ${res}`);
      })
      .catch((err) => {
        // return { role: "assistant", content: `error happened` };
      });
  };

  return (
    <div className="flex flex-row ml-3 m-2 gap-4 h-screen overflow-hidden paper-page">
      <div className="w-full h-screen">
        {pdfUrl && <iframe src={pdfUrl} className="w-full h-screen" title="arXiv PDF" allowFullScreen />}
      </div>
      <div className="h-screen bg-background">
        <ChatInterface onSendMessageToAi={onSendMessageToAi} pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
