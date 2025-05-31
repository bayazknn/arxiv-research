import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError){
        return NextResponse.json({success:false, error: userError})
    }


    const data = await req.json()
    const url = new URL("/api/extract-pdf-text", req.url).toString();
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfUrl: data.link.replace("abs", "pdf") })
    });

    let extractResponse;
    try {
        extractResponse = await response.json();

    } catch (err) {
        console.error("Error parsing PDF extraction response:", err);
        extractResponse = { success: false, error: err instanceof Error ? err.message : 'Unknown error parsing response' };
    }



    const { data: paperResponse, error: paperError } = await supabase
    .from('papers')
    .upsert({
        ...data,
        content: extractResponse.fullText?.replace(/\u0000/g, '') ?? '',
        user_id: user?.id,
        email: user?.email,
    }) // Insert the new paper
    .select(); // Use select() to return the inserted row

    if (paperError) {
        console.error('Error inserting paper:', paperError);
        return NextResponse.json({success:false, error: paperError});
    }

    if (paperResponse && paperResponse.length > 0) {
        return NextResponse.json({success:true, data: paperResponse[0]});
    } else {
        return NextResponse.json({success:false, error: "Failed to insert paper." });
    }
}
