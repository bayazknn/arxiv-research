import { streamText, tool } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export type AIModelName = keyof typeof AI_MODELS;

export const AI_MODELS = {
  "gemini-2.0-flash-exp": google("gemini-2.0-flash-exp"),
  "gemini-1.5-pro": google("gemini-1.5-pro"),
  "gemini-1.5-flash": google("gemini-1.5-flash"),
} as const;

export const tools = {
  calculateMath: tool({
    description: "Calculate mathematical expressions",
    parameters: z.object({
      expression: z.string().describe("The mathematical expression to calculate"),
    }),
    execute: async ({ expression }) => {
      try {
        // Simple math evaluation (in production, use a proper math library)
        const result = Function(`"use strict"; return (${expression})`)()
        return { result, expression }
      } catch (error) {
        return { error: "Invalid mathematical expression", expression }
      }
    },
  }),

  generateCode: tool({
    description: "Generate code snippets based on requirements",
    parameters: z.object({
      language: z.string().describe("Programming language"),
      description: z.string().describe("What the code should do"),
      framework: z.string().optional().describe("Framework or library to use"),
    }),
    execute: async ({ language, description, framework }) => {
      return {
        language,
        description,
        framework,
        code: `// Generated ${language} code for: ${description}\n// Framework: ${framework || "None"}\n\n// Implementation would go here...`,
      }
    },
  }),

  searchWeb: tool({
    description: "Search the web for information",
    parameters: z.object({
      query: z.string().describe("Search query"),
      limit: z.number().optional().describe("Number of results to return"),
    }),
    execute: async ({ query, limit = 5 }) => {
      // Simulate web search results
      return {
        query,
        results: Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
          title: `Search result ${i + 1} for "${query}"`,
          url: `https://example.com/result-${i + 1}`,
          snippet: `This is a simulated search result snippet for ${query}. It contains relevant information about the topic.`,
        })),
      }
    },
  }),
}

export async function generateAIResponse(
  messages: any[],
  model: AIModelName = "gemini-2.0-flash-exp",
  useTools = true
) {
  const selectedModel = AI_MODELS[model] || AI_MODELS["gemini-2.0-flash-exp"]

  try {
    const result = await streamText({
      model: selectedModel,
      messages,
      tools: useTools ? tools : undefined,
      maxSteps: 5,
      temperature: 0.7,
    })

    return result
  } catch (error) {
    console.error("AI generation error:", error)
    throw error
  }
}
