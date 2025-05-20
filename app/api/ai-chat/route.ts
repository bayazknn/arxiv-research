// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { gemini } from "@/utils/ai/gemini";

export async function POST(req: NextRequest) {
    const { messages } = await req.json();
    // const user_msg = messages.pop()
    // console.log(user_msg)
    const response = await gemini.invoke(messages);

  const reply = response.content || "No response";
  return NextResponse.json({ reply });
}
