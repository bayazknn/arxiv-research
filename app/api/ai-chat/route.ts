// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { simpleAgent } from "@/ai/simple-agent";
import { ChatSession } from "@/types/chat";

export async function POST(req: NextRequest) {
    // const { messages } = await req.json();
    // const response = await gemini.invoke(messages);
  
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

  console.log("messages edited: ", messages)

  const response = await simpleAgent.invoke(
    {messages: messages},
    {configurable: {pdfUrl: pdfUrl}}
  );
console.log("ai raw response object: ", response)
  const responseMessage = response.messages[response.messages.length-1]

  // console.log("ai raw response: ", response.messages)

  
  return NextResponse.json({ role:"assistant", content: responseMessage.content });

}
