// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { simpleAgent , llm, getPdfTextContext} from "@/ai/simple-agent";
import { ChatSession } from "@/types/chat";


export async function POST(req: NextRequest) {
  const state = await req.json()
  console.log("got state: ", state)
  const session = state.session as ChatSession
  const pdfUrl = state.pdfUrl as string

  const messages = session.messages
  .filter(message => message.content.some(con=>con.content!==""))
  .map((message) => (
    {role: message.role, content: message.content.map((con)=>{
      return con.content 
    }).filter(f=>f!=="").join(" ")
    }
  ))



  try {
    const response = await simpleAgent.invoke(
      {messages: messages},
      {configurable: {pdfUrl: pdfUrl}}
    );
    console.log("ai raw response object: ", response)
    const responseMessage = response.messages[response.messages.length-1]

    return NextResponse.json({ role:"assistant", content: responseMessage.content });
  } catch (error: any) {
    console.error("Error invoking simpleAgent:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", details: error.message },
      { status: 500 }
    );
  }
}
