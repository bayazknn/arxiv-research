import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {fetchArxivByIds} from "@/utils/arxiv/arxiv-search"

export async function POST(req: NextRequest, res: NextResponse & { params: any }) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError){
        return NextResponse.json({success:false, error: userError})
    }


    const { sessions, link, workspaceId } = await req.json().then((data) => {
      return data;
    }).catch((err)=>{
        return NextResponse.json({success:false, error: err})
    })

    const arxivId = link.split("/").pop();
    console.log("Fetching arXiv data for ID:", arxivId);
    const arxivResponse = await fetchArxivByIds(arxivId)

    const payload = {
        user_id: user?.id,
        email: user?.email,
        ...arxivResponse[0],
        workspace_id: workspaceId
    }

    console.log("arxiv fetchArxivByIds response: ", arxivResponse)
    console.log("arxiv fetchArxivByIds response type: ", typeof arxivResponse[0])
    console.log("arxiv fetchArxivByIds response link: ", arxivResponse[0].link)
    console.log("Inserting paper with payload:", payload);

    
    // Fetch papers with related chats
const { data: papersWithChat, error: paperWithChatError } = await supabase
  .from("papers")
  .select(`*, chats(*)`)
  .eq("link", arxivResponse[0].link)
  .eq("workspace_id", workspaceId);

console.log("paperWithChat: ", papersWithChat);

if (paperWithChatError) {
  console.error('Error fetching papers with chats:', paperWithChatError);
  return NextResponse.json({success:false, error: paperWithChatError});
} 

if (papersWithChat && papersWithChat.length > 0) {
  // If papers exist, handle the chat logic
  const chat = papersWithChat[0].chats[0]; // Access the first chat if it exists
  if (chat) {
    // Update existing chat
    const { data: chatResponse, error: chatError } = await supabase
      .from('chats')
      .update({
        sessions: sessions,
        user_id: user?.id,
        email: user?.email,
      })
      .eq("id", chat.id);

    if (chatError) {
      console.error('Error updating chat:', chatError);
      return NextResponse.json(chatError);
    } else {
      return NextResponse.json(chatResponse);
    }
  } else {
    // If no chat exists, insert a new chat
    const { data: chatResponse, error: chatError } = await supabase
      .from('chats')
      .insert({
        paper_id: papersWithChat[0].id, // Use the first paper's ID
        sessions: sessions,
        user_id: user?.id,
        email: user?.email,
      });

    if (chatError) {
      console.error('Error inserting chat:', chatError);
      return NextResponse.json({success:false, error: chatError});
    } else {
      return NextResponse.json({success:true, data: chatResponse});
    }
  }
} else {
  // If no papers exist, create a new paper entry
  const { data: paperResponse, error: paperError } = await supabase
    .from('papers')
    .insert(payload) // Insert the new paper
    .select(); // Use select() to return the inserted row

  if (paperError) {
    console.error('Error inserting paper:', paperError);
    return NextResponse.json({success:false, error: paperError});
  }

  if (paperResponse && paperResponse.length > 0) {
    // After inserting the paper, insert the corresponding chat
    const { data: chatResponse, error: chatError } = await supabase
      .from('chats')
      .insert({
        paper_id: paperResponse[0].id, // Use the first inserted paper's ID
        sessions: sessions,
        user_id: user?.id,
        email: user?.email,
      });

    if (chatError) {
      console.error('Error inserting chat:', chatError);
      return NextResponse.json({success:false, error: chatError});
    } else {
      return NextResponse.json({success:true, data: chatResponse});
    }
  } else {
    return NextResponse.json({success:false, error: "Failed to insert paper." });
  }
}

// If no conditions are met, return a message
return NextResponse.json({success:false, error: "No action taken." });
    


}
