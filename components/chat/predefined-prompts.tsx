"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Sparkles } from "lucide-react"
import type { PredefinedPrompt } from "@/types/chat"

interface PredefinedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function PredefinedPrompts({ onSelectPrompt }: PredefinedPromptsProps) {
  const [prompts, setPrompts] = useState<PredefinedPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/prompts?limit=6")
      if (!response.ok) {
        throw new Error("Failed to fetch prompts")
      }
      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prompts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors = {
      research: "bg-blue-100 text-blue-800 border-blue-200",
      summary: "bg-green-100 text-green-800 border-green-200",
      coding: "bg-purple-100 text-purple-800 border-purple-200",
      analysis: "bg-orange-100 text-orange-800 border-orange-200",
      critique: "bg-red-100 text-red-800 border-red-200",
      debugging: "bg-yellow-100 text-yellow-800 border-yellow-200",
      optimization: "bg-indigo-100 text-indigo-800 border-indigo-200",
      education: "bg-pink-100 text-pink-800 border-pink-200",
      testing: "bg-teal-100 text-teal-800 border-teal-200",
      architecture: "bg-cyan-100 text-cyan-800 border-cyan-200",
      database: "bg-emerald-100 text-emerald-800 border-emerald-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3 mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <div className="mb-4">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Unable to load prompts from the server</p>
        </div>
        <Button onClick={fetchPrompts} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No prompts available</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Choose a prompt to get started</h3>
        </div>
        <Button onClick={fetchPrompts} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {prompt.title}
                </CardTitle>
                <Badge variant="secondary" className={getCategoryColor(prompt.category)}>
                  {prompt.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{prompt.prompt}</p>
              <Button
                onClick={() => onSelectPrompt(prompt.prompt)}
                variant="outline"
                className="w-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Use This Prompt
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
