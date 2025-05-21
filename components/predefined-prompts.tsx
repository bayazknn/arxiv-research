"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PredefinedPrompt } from "@/types/chat"

const DEFAULT_PROMPTS: PredefinedPrompt[] = [
  {
    id: "1",
    title: "Explain a research paper",
    prompt: "Can you explain the key findings and methodology of this research paper?",
  },
  {
    id: "2",
    title: "Summarize in bullet points",
    prompt: "Summarize the main points of this paper in a bulleted list.",
  },
  {
    id: "3",
    title: "Generate code example",
    prompt: "Can you provide a code example that implements the algorithm described in this paper?",
  },
  {
    id: "4",
    title: "Compare with other papers",
    prompt: "How does this paper compare to other recent work in the same field?",
  },
  {
    id: "5",
    title: "Explain limitations",
    prompt: "What are the limitations or potential weaknesses of the approach described in this paper?",
  },
]

interface PredefinedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function PredefinedPrompts({ onSelectPrompt }: PredefinedPromptsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {DEFAULT_PROMPTS.map((prompt) => (
        <Card key={prompt.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">{prompt.title}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{prompt.prompt}</p>
            <Button onClick={() => onSelectPrompt(prompt.prompt)} variant="outline" className="w-full">
              Use Prompt
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
