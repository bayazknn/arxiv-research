// app/api/extract-pdf-text/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";


export async function POST(req: NextRequest) {
  try {
    const {url} = await req.json()
    console.log(`request body url: ${url}`)

    const buffer = await fetch(url).then((res) => res.arrayBuffer());
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    return NextResponse.json({ text: text, totalPages: totalPages });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
