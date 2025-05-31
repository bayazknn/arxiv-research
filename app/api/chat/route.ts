import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";
import { google } from "@ai-sdk/google"
import {createClient} from "@/utils/supabase/server"


export async function POST(req: Request) {
  console.log("=== New Chat Request ===");
  console.log(`Time: ${new Date().toISOString()}`);
  const {messages, model, pdfContent} = await req.json();


  const systemPrompt = `
  You are a professor of phd students. You are expected to given best answer about given pdf text context.
  User your knowledge and experience and the pdf text context to answer the user. 
  Give key insights and deep analysis to enhance user research projects.
  
  #PDF Context: 
  ${pdfContent}
  #End PDF Context#
      `
  console.log("pdf extracted in /chat route: ", pdfContent.substring(0, 50) + '...')

  try {
    const selectedModel = google(model || "gemini-2.0-flash-exp")

    // Stream the response
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: typeof msg.content === "string" ? msg.content : msg.content,
    }))


    const result = await streamText({
      model: selectedModel,
      messages: [{role: "user", content: systemPrompt}, ...formattedMessages],
      temperature: 0.4,
      maxTokens: 2048,
    })

    // Return the streaming response
    return result.toTextStreamResponse()


  } catch(error){
    console.error("Error streaming response:", error)
    return NextResponse.json(
      { success: false, error: error },
      { status: 500 }
    );
  }
}