import { NextResponse } from "next/server"
import { streamText } from "ai";
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  console.log("=== New Chat Request ===");
  console.log(`Time: ${new Date().toISOString()}`);
  
  try {


    const { arxiv_paper_url } = await req.json();

    const fastApiResponse = await fetch(
      `http://localhost:8000/stream?arxiv_paper_url=${encodeURIComponent(arxiv_paper_url)}`
    );
  
    return new Response(fastApiResponse.body, {
      status: fastApiResponse.status,
      headers: {
        "Content-Type": "text/event-stream", // ✅ correct for SSE
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });


  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    
    // Return a detailed error response with fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse = `I encountered an issue connecting to the AI service. Here's what I can help you with in demo mode:

**Error Details**: ${errorMessage}

## Available Features:
- Code examples and explanations
- Programming assistance
- General questions and discussions

\`\`\`javascript
// Example: Error handling in JavaScript
try {
  const result = await apiCall();
  console.log('Success:', result);
} catch (err) {
  console.error('Error occurred:', err instanceof Error ? err.message : 'Unknown error');
  // Fallback behavior
}
\`\`\`

What would you like to explore?`;

    return NextResponse.json({
      content: errorResponse,
      role: "assistant",
      provider: "error-fallback",
    });
  }
}
