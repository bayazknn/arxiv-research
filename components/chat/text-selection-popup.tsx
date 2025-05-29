"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Copy, Quote, MessageSquare, Bookmark, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TextSelectionPopupProps {
  onCopy?: (text: string) => void
  onQuote?: (text: string) => void
  onAction1?: (text: string) => void
  onAction2?: (text: string) => void
}

export function TextSelectionPopup({ onCopy, onQuote, onAction1, onAction2 }: TextSelectionPopupProps) {
  const [selectedText, setSelectedText] = useState("")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const popupRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text && text.length > 0) {
        setSelectedText(text)

        // Get selection position
        const range = selection?.getRangeAt(0)
        if (range) {
          const rect = range.getBoundingClientRect()
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          })
          setIsVisible(true)
        }
      } else {
        setIsVisible(false)
        setSelectedText("")
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsVisible(false)
        setSelectedText("")
      }
    }

    document.addEventListener("mouseup", handleSelection)
    document.addEventListener("keyup", handleSelection)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mouseup", handleSelection)
      document.removeEventListener("keyup", handleSelection)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText)
      setCopiedStates((prev) => ({ ...prev, copy: true }))

      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, copy: false }))
      }, 2000)

      onCopy?.(selectedText)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleQuote = () => {
    onQuote?.(selectedText)
    setIsVisible(false)
  }

  const handleAction1 = () => {
    onAction1?.(selectedText)
    setIsVisible(false)
  }

  const handleAction2 = () => {
    onAction2?.(selectedText)
    setIsVisible(false)
  }

  if (!isVisible || !selectedText) return null

  return (
    <TooltipProvider>
      <div
        ref={popupRef}
        className={cn(
          "fixed z-50 bg-background border rounded-lg shadow-lg p-1 flex items-center gap-1",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%) translateY(-100%)",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
              {copiedStates.copy ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copiedStates.copy ? "Copied!" : "Copy to clipboard"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleQuote} className="h-8 w-8 p-0">
              <Quote className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quote text</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleAction1} className="h-8 w-8 p-0">
              <MessageSquare className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Action 1</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleAction2} className="h-8 w-8 p-0">
              <Bookmark className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Action 2</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
