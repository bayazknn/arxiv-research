import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";
import { google } from "@ai-sdk/google"

// Initialize Google Generative AI
function getGenAIModel(apiKey: string, modelName: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

// Mock response generator with better code examples
function generateMockResponse(messages: any[]) {
  const lastMessage = messages[messages.length - 1]?.content || ""
  const lastMessageStr = Array.isArray(lastMessage) 
    ? lastMessage.map((c: any) => typeof c === 'object' ? c.content : String(c)).join('\n')
    : String(lastMessage);

  // Simple mock responses based on content
  if (lastMessageStr.toLowerCase().includes("math") || lastMessageStr.toLowerCase().includes("calculate")) {
    return {
      content: "I can help you with math calculations! Here's an example:\n\n**Problem**: What's 15 × 23?\n\n**Solution**: 15 × 23 = 345\n\n```python\n# Python calculation example\ndef calculate_product(a, b):\n    return a * b\n\nresult = calculate_product(15, 23)\nprint(f\"15 × 23 = {result}\")\n```\n\nWould you like me to calculate something specific for you?"
    };
  }

  if (lastMessageStr.toLowerCase().includes("code") || lastMessageStr.toLowerCase().includes("program")) {
    return {
      content: 'I can help you generate code! Here\'s a React component example:\n\n```jsx\nimport React, { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className=\"p-4 border rounded-lg\">\n      <h2 className=\"text-xl font-bold mb-4\">Count: {count}</h2>\n      <div className=\"space-x-2\">\n        <button \n          onClick={() => setCount(count + 1)}\n          className=\"px-4 py-2 bg-blue-500 text-white rounded\"\n        >\n          Increment\n        </button>\n        <button \n          onClick={() => setCount(count - 1)}\n          className=\"px-4 py-2 bg-red-500 text-white rounded\"\n        >\n          Decrement\n        </button>\n      </div>\n    </div>\n  );\n}\n```\n\nWhat kind of code would you like me to help you with?'
    };
  }

  // Default responses
  const defaultResponses = [
    "Hello! I'm here to help you with your questions. How can I assist you today?",
    "I'm ready to help! What would you like to know?",
    "How can I assist you with your research today?"
  ];

  return {
    content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
  };
}

export async function POST(req: Request) {
  console.log("=== New Chat Request ===");
  console.log(`Time: ${new Date().toISOString()}`);
  
  try {
    // Parse request body
    let messages, model;
    try {
      const body = await req.json();
      messages = body.messages;
      model = body.model || "gemini-2.0-flash-exp";
      
      if (!messages || !Array.isArray(messages)) {
        throw new Error("Invalid messages array in request");
      }
      
      console.log(`Request details:`, {
        model,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content?.substring(0, 50) + '...'
      });
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format", details: parseError instanceof Error ? parseError.message : 'Unknown error' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    const hasApiKey = !!apiKey;
    
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey,
      apiKeyStartsWith: hasApiKey ? apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4) : 'N/A',
      model
    });

    // Determine which model to use based on availability
    let modelProvider = "mock";
    
    // Handle Gemini models
    if (model.startsWith("gemini")) {
      if (!hasApiKey) {
        console.error('[Chat API] Google Gemini API key is not configured');
        return NextResponse.json(
          { 
            error: 'Google Gemini API key is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in your environment variables.',
            requiresApiKey: true
          },
          { status: 401 }
        );
      }

      try {
        console.log(`[Chat API] Initializing Google Gemini model: ${model}`);
        console.log(`[Chat API] Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
        
        modelProvider = "google"; // Set modelProvider when using Google model
        const selectedModel = google(model)

        // Stream the response
        const formattedMessages = messages.map((msg: any) => ({
          role: msg.role,
          content: typeof msg.content === "string" ? msg.content : msg.content,
        }))

        console.log("formatted message to sent ai: ", formattedMessages)

        const result = await streamText({
          model: selectedModel,
          messages: formattedMessages,
          temperature: 0.7,
          maxTokens: 2048,
        })
    
        console.log(`Successfully created stream for ${Object.entries(result)}`)
    
        // Return the streaming response
        return result.toTextStreamResponse({
          headers: {
            "X-Model-Provider": modelProvider,
            "X-Model-Name": model,
          },
        })


      } catch(error){
        console.error("Error streaming response:", error)
      }
    }



    // This code path should no longer be reached as we handle all cases above
    console.error('Unexpected code path reached in chat API');
    return NextResponse.json(
      { error: "Internal server error - unexpected code path" },
      { status: 500 }
    );
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
