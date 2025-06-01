import { NextResponse } from "next/server"
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { useArxivPaperStore } from "@/lib/arxiv-store";

// Define interface for the expected request body
interface Prompt {
  title: string
  prompt: string
  category: string
}

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

export async function POST(request: Request) {

  const {pdfContent} = await request.json();
  console.log("Received request data:", pdfContent.trim().substring(0, 100) + '...'); // Log received data

// Construct the prompt using the received paper data
const prompt = `You are question generator for arxiv paper. Generate 6 questions for this paper which content text is below.
  Your questions are responded from experts. You use paper abstract to generate questions.
  Your generated questions cover main points of paper. 
  Dont generate simple questions like "What is this paper about?" or "What is the main contribution of this paper?". 
  Your generated questions are used in phd research. Questions must be creative and reveal deep insights of paper. 
  Your response format is json and dont include any other text. Your responses are directly parsed as json.
  
  #Question Model Format#
  Every question item has title, prompt, category.
  title: short format of question title
  prompt: Question has 50 words max. Prompt has include questions and be formatted as modern llm prompt engineering rules.
  category: One single word to categorize the questions. Category keyword reflects the type of question.
  #End Question Model Format#




  #Response Format#
  [
    {
    title: "Explain a research papcontenter",
    prompt: "Can you explain the key findings and methodology of this research paper?",
    category: "research",
    },
    {
    title: "Explain limitations",
    prompt: "What are the limitations or potential weaknesses of the approach described in this paper?",
    category: "critique",
    },
    {
    title: "Compare with other papers",
    prompt: "How does this paper compare to other recent work in the same field?",
    category: "analysis",
    }
  ]
  #End Response Format#




  #Negative Prompt for Response#
  Dont add introdutory wordings. Follow below templates:
  <Comparative Response>
    <Bad Response>
    The study compares brute force TSK, cascading GFT, and FCM-based approaches. 
    What are the trade-offs in terms of accuracy, complexity, and interpretability between these three GFS strategies when applied to the Airfoil Self Noise dataset?
    </Bad Response>
    <Good Response>
    What are the trade-offs in terms of accuracy, complexity, and interpretability between these three GFS strategies when applied to the Airfoil Self Noise dataset?
    </Good Response>
  </Comparative Response>
  <Comparative Response>
    <Bad Response>
      The paper explores three GFS strategies. What are the trade-offs in terms of explainability, computational cost, and predictive accuracy between brute force TSK, cascading GFT, and FCM-based approaches, especially considering their application to the Airfoil Self Noise dataset?
    </Bad Response>
    <Good Response>
      What are the trade-offs in terms of explainability, computational cost, and predictive accuracy between brute force TSK, cascading GFT, and FCM-based approaches, especially considering their application to the Airfoil Self Noise dataset?
    </Good Response>
  </Comparative Response>
  #End Negative Prompt for Response#
  


  #Paper Content Text#
  ${pdfContent}
  #End Paper Content Text#
  `


  try {
    const model = google("gemini-2.0-flash-exp");

    const result = await generateText({
      model,
      prompt,
    });
    console.log("ai response result", result.text.trim().substring(0, 50) + '...');

    const cleaned = result.text
      .replace(/^```json\s*/i, "") // Remove ```json at the start
      .replace(/```$/, "") // Remove ``` at the end
      .trim();

    const parsedResult = JSON.parse(cleaned);

    return Response.json({
      prompts: parsedResult ?? [],
      total: Array.isArray(parsedResult) ? parsedResult.length : 0,
    });
  } catch (error) {
    try {
      const { searchParams } = new URL(request.url);
      const limit = Number.parseInt(searchParams.get("limit") || "6");
      const category = searchParams.get("category");

      let filteredPrompts = PREDEFINED_PROMPTS;

      // Filter by category if specified
      if (category && category !== "all") {
        filteredPrompts = PREDEFINED_PROMPTS.filter((prompt) => prompt.category === category);
      }

      // Shuffle and limit the results
      const shuffled = [...filteredPrompts].sort(() => 0.5 - Math.random());
      const selectedPrompts = shuffled.slice(0, limit);

      return NextResponse.json({
        prompts: selectedPrompts ?? [],
        total: Array.isArray(filteredPrompts) ? filteredPrompts.length : 0,
      });
    } catch (finalError) {
      // Final fallback: always return a valid structure
      return NextResponse.json({
        prompts: [],
        total: 0,
        error: "Unexpected error occurred while generating prompts."
      });
    }
  }




}
