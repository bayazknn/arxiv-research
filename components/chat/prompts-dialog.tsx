"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useArxivPaperStore } from "@/lib/arxiv-store"

interface Prompt {
  id: string
  title: string
  prompt: string
  category: string
}

interface PromptsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPrompt: (prompt: string) => void
}

export function PromptsDialog({ open, onOpenChange, onSelectPrompt }: PromptsDialogProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const store = useArxivPaperStore();
  const selectArxivPaperByLink = store?.selectArxivPaperByLink || (() => undefined);


  

  const fetchPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const link = searchParams.get("link")
      if (!link) {
        throw new Error("Paper link not found")
      }
      const paper = selectArxivPaperByLink(link)
      if (!paper) {
        throw new Error("Paper not found")
      }
      const response = await fetch("/api/prompts?",{
        method:"POST",
        body: JSON.stringify({
          link: paper.link,
          title: paper.title,
          summary: paper.summary,
        })
      })
      if (!response.ok) {
        throw new Error("Failed to fetch prompts")
      }
      const data = await response.json()
      setPrompts(data.prompts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prompts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchPrompts()
    }
  }, [open])

  const handleSelectPrompt = (prompt: string) => {
    onSelectPrompt(prompt)
    onOpenChange(false)
  }

  const getCategoryColor = () => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-red-100 text-red-800 border-red-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
    ]
    return colors[Math.floor(Math.random() * colors.length)] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Choose a Prompt
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading prompts...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchPrompts} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && prompts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prompts.map((prompt, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{prompt.title}</h3>
                      <Badge variant="secondary" className={`py-0.5 text-[10px] ${getCategoryColor()}`}>
                        {prompt.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs mb-4 line-clamp-3">{prompt.prompt}</p>
                    <Button
                      onClick={() => handleSelectPrompt(prompt.prompt)}
                      variant="outline"
                      className="w-full text-xs"
                    >
                      Use This Prompt
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && prompts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No prompts available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => fetchPrompts()} variant="outline" disabled={loading}>
            Refresh Prompts
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
