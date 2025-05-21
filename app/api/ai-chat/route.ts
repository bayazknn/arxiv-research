// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { simpleAgent } from "@/ai/simple-agent";

export async function POST(req: NextRequest) {
    // const { messages } = await req.json();
    // const response = await gemini.invoke(messages);
  
  const state = await req.json()
  console.log("got state: ", state)
  const messages = state.messages
  const pdfUrl = state.pdfUrl

  const response = await simpleAgent.invoke(
    {messages: messages},
    {configurable: {pdfUrl: pdfUrl}}
  );
  const responseMessage = response.messages[response.messages.length-1]

  console.log("ai raw response: ", response.messages)

  return NextResponse.json({ role:"assistant", text: responseMessage.content });
  // return NextResponse.json({ role:"assistant", content: responseMessage.content });

}
