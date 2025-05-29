import { NextRequest, NextResponse } from "next/server";
import { simpleAgent, llm, getPdfTextContext } from "@/ai/simple-agent";
import { ChatSession } from "@/types/chat";


export async function POST(request: NextRequest) {
    const content = request.nextUrl.searchParams.get('content') || '';

    // let session = localStorage.getItem("session") ?? JSON.stringify({ messages: [] });
    // session = JSON.parse(session)

    // let messages = session.messages
    // .filter((message: any) => message.content.some((con: any)=>con.content!==""))
    // .map((message: any) => (
    //   {role: message.role, content: message.content.map((con: any)=>{
    //     return con.content 
    //   }).filter((f: any)=>f!=="").join(" ")
    //   }
    // ))

    const systemMsg = `"You are a scientific advisor to analyze arxiv papers. 
    "`;

    // console.log("messages edited: ", messages)
    // messages.unshift({role: "system", content: systemMsg})

    const stream = await llm.stream(content)
  
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }