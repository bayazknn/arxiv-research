"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"

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

  const fetchPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/prompts?limit=8")
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

  const getCategoryColor = (category: string) => {
    const colors = {
      research: "bg-blue-100 text-blue-800",
      summary: "bg-green-100 text-green-800",
      coding: "bg-purple-100 text-purple-800",
      analysis: "bg-orange-100 text-orange-800",
      critique: "bg-red-100 text-red-800",
      debugging: "bg-yellow-100 text-yellow-800",
      optimization: "bg-indigo-100 text-indigo-800",
      education: "bg-pink-100 text-pink-800",
      testing: "bg-teal-100 text-teal-800",
      architecture: "bg-cyan-100 text-cyan-800",
      database: "bg-emerald-100 text-emerald-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
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
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{prompt.title}</h3>
                      <Badge variant="secondary" className={getCategoryColor(prompt.category)}>
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
