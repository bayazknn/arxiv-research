"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Calculator, Code, Search } from "lucide-react"

interface ToolResultProps {
  toolCall: {
    id: string
    name: string
    args: Record<string, any>
    result?: any
    status: "pending" | "completed" | "error"
  }
}

export function ToolResult({ toolCall }: ToolResultProps) {
  const { name, args, result, status } = toolCall

  const getToolIcon = () => {
    switch (name) {
      case "calculateMath":
        return <Calculator className="h-4 w-4" />
      case "generateCode":
        return <Code className="h-4 w-4" />
      case "searchWeb":
        return <Search className="h-4 w-4" />
      default:
        return <Code className="h-4 w-4" />
    }
  }

  const getToolTitle = () => {
    switch (name) {
      case "calculateMath":
        return "Math Calculation"
      case "generateCode":
        return "Code Generation"
      case "searchWeb":
        return "Web Search"
      default:
        return name
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (status === "pending") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {getToolIcon()}
            {getToolTitle()}
            <Badge variant="secondary" className="text-xs">
              Running...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="animate-pulse">Processing...</div>
        </CardContent>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-2xl border-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-destructive">
            {getToolIcon()}
            {getToolTitle()}
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <p className="text-destructive">Tool execution failed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {getToolIcon()}
          {getToolTitle()}
          <Badge variant="secondary" className="text-xs">
            Completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3">
        {name === "calculateMath" && result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expression:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">{args.expression}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Result:</span>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-xs font-bold">{result.result}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(result.result.toString())}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {name === "generateCode" && result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Language:</span>
              <Badge variant="outline" className="text-xs">
                {result.language}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="mt-1 text-xs">{result.description}</p>
            </div>
            {result.framework && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Framework:</span>
                <Badge variant="outline" className="text-xs">
                  {result.framework}
                </Badge>
              </div>
            )}
            <div className="relative">
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                <code>{result.code}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => handleCopy(result.code)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {name === "searchWeb" && result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Query:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">{result.query}</code>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Results:</span>
              {result.results.map((item: any, index: number) => (
                <div key={index} className="border rounded p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-xs">{item.title}</h4>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.snippet}</p>
                  <p className="text-xs text-blue-600">{item.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
