import 'lib/polyfills';
// pages/api/extract-pdf.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from 'pdf-parse';

// Optional: Type definition for the request body
interface ExtractPdfRequestBody {
    pdfUrl: string;
}

export async function POST(req: NextRequest) {



    const { pdfUrl } = await req.json();
    console.log("extract pdf text api route hit", pdfUrl)

    if (!pdfUrl) {
        return NextResponse.json({ message: 'PDF URL is required' });
    }

    try {
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch PDF from URL: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('[Server] PDF fetched successfully. Starting parsing...');

        const data = await pdf(buffer);
        console.log("parsed pdf data info", data.info)
        console.log("parsed pdf data metadata", data.metadata)

        return NextResponse.json({
            success: true,
            pdfUrl: pdfUrl,
            numPages: data.numpages,
            metadata: {
                info: data.info,
                metadata: data.metadata,
            },
            fullText: data.text
        });

    } catch (error) {
        console.error('[Server] An error occurred while processing PDF:', error);
        if (error instanceof Error) {
            return NextResponse.json({ success: false, message: error.message });
        }
        return NextResponse.json({ success: false, message: 'An unknown error occurred.' });
    }
}