"use client"

import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react"
import type { Attachment } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PaperclipIcon, Send, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface ChatInputAreaProps {
  onSendMessage: (message: string, attachments: Attachment[]) => void
  placeholder?: string
  disabled?: boolean
  quotedText?: string
  onClearQuote?: () => void
}

export function ChatInputArea({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  quotedText,
  onClearQuote,
}: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update input value when quoted text changes
  useEffect(() => {
    if (quotedText) {
      const quotedMessage = `> ${quotedText.replace(/\n/g, "\n> ")}\n\n`
      setInputValue(quotedMessage)
      // Focus the textarea and move cursor to end
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(quotedMessage.length, quotedMessage.length)
        }
      }, 0)
    }
  }, [quotedText])

  const handleSendMessage = () => {
    if (inputValue.trim() || attachments.length > 0) {
      onSendMessage(inputValue, attachments)
      setInputValue("")
      setAttachments([])
      onClearQuote?.()

      // Focus the textarea after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => {
        const isImage = file.type.startsWith("image/")
        const attachment: Attachment = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          isImage,
        }

        // Generate preview for images
        if (isImage) {
          attachment.previewUrl = URL.createObjectURL(file)
        }

        return attachment
      })

      setAttachments((prev) => [...prev, ...newFiles])
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const filtered = prev.filter((attachment) => attachment.id !== id)

      // Revoke object URLs to prevent memory leaks
      const removed = prev.find((attachment) => attachment.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.url)
        if (removed.previewUrl) {
          URL.revokeObjectURL(removed.previewUrl)
        }
      }

      return filtered
    })
  }

  const handleClearQuote = () => {
    // Remove quoted text from input
    const lines = inputValue.split("\n")
    const nonQuotedLines = lines.filter((line) => !line.startsWith("> "))
    setInputValue(nonQuotedLines.join("\n").trim())
    onClearQuote?.()
  }

  const hasQuotedText = inputValue.includes("> ")

  return (
    <div className="border-t p-3">
      {/* Quote indicator */}
      {hasQuotedText && (
        <div className="mb-2 p-2 bg-muted rounded-md flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Replying to:</div>
            <div className="text-xs border-l-2 border-primary pl-2">
              {inputValue
                .split("\n")
                .filter((line) => line.startsWith("> "))
                .map((line) => line.substring(2))
                .join("\n")}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearQuote} className="h-6 w-6 p-0 ml-2">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative group">
              <div className="h-12 w-12 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                {attachment.isImage && attachment.previewUrl ? (
                  <img
                    src={attachment.previewUrl || "/placeholder.svg"}
                    alt={attachment.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold uppercase">{attachment.name.split(".").pop()}</span>
                )}
              </div>
              <button
                type="button"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                onClick={() => handleRemoveAttachment(attachment.id)}
              >
                ×
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1 text-[8px] text-white text-center truncate">
                {attachment.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2 bg-muted rounded-lg p-2"
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="min-h-[50px] text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            type="button"
            disabled={disabled}
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="ml-1 h-8 w-8"
            disabled={disabled || (!inputValue.trim() && attachments.length === 0)}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </form>
    </div>
  )
}
