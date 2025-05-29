import { NextResponse } from "next/server"

const PREDEFINED_PROMPTS = [
  {
    id: "1",
    title: "Explain a research paper",
    prompt: "Can you explain the key findings and methodology of this research paper?",
    category: "research",
  },
  {
    id: "2",
    title: "Summarize in bullet points",
    prompt: "Summarize the main points of this paper in a bulleted list.",
    category: "summary",
  },
  {
    id: "3",
    title: "Generate code example",
    prompt: "Can you provide a code example that implements the algorithm described in this paper?",
    category: "coding",
  },
  {
    id: "4",
    title: "Compare with other papers",
    prompt: "How does this paper compare to other recent work in the same field?",
    category: "analysis",
  },
  {
    id: "5",
    title: "Explain limitations",
    prompt: "What are the limitations or potential weaknesses of the approach described in this paper?",
    category: "critique",
  },
  {
    id: "6",
    title: "Create React component",
    prompt: "Create a React component with TypeScript that includes state management and proper error handling.",
    category: "coding",
  },
  {
    id: "7",
    title: "Debug this code",
    prompt: "Help me debug this code and explain what might be causing the issue.",
    category: "debugging",
  },
  {
    id: "8",
    title: "Optimize performance",
    prompt: "How can I optimize the performance of this algorithm or code snippet?",
    category: "optimization",
  },
  {
    id: "9",
    title: "Explain machine learning concept",
    prompt: "Explain this machine learning concept in simple terms with practical examples.",
    category: "education",
  },
  {
    id: "10",
    title: "Write unit tests",
    prompt: "Write comprehensive unit tests for this function or component.",
    category: "testing",
  },
  {
    id: "11",
    title: "API design review",
    prompt: "Review this API design and suggest improvements for better usability and performance.",
    category: "architecture",
  },
  {
    id: "12",
    title: "Database schema design",
    prompt: "Help me design a database schema for this application with proper relationships and indexing.",
    category: "database",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")
    const category = searchParams.get("category")

    let filteredPrompts = PREDEFINED_PROMPTS

    // Filter by category if specified
    if (category && category !== "all") {
      filteredPrompts = PREDEFINED_PROMPTS.filter((prompt) => prompt.category === category)
    }

    // Shuffle and limit the results
    const shuffled = [...filteredPrompts].sort(() => 0.5 - Math.random())
    const selectedPrompts = shuffled.slice(0, limit)

    return NextResponse.json({
      prompts: selectedPrompts,
      total: filteredPrompts.length,
    })
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}
