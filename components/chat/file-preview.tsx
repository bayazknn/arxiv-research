"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilePreviewProps {
  files: File[]
  onRemove: (index: number) => void
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file, index) => (
        <FileItem key={index} file={file} onRemove={() => onRemove(index)} />
      ))}
    </div>
  )
}

interface FileItemProps {
  file: File
  onRemove: () => void
}

function FileItem({ file, onRemove }: FileItemProps) {
  const [preview, setPreview] = useState<string | null>(null)

  // Generate preview for images
  useState(() => {
    if (!file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })

  const getFileIcon = () => {
    if (file.type.startsWith("image/")) {
      return preview ? (
        <img src={preview || "/placeholder.svg"} alt={file.name} className="h-full w-full object-cover rounded-md" />
      ) : (
        <div className="h-full w-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      )
    }

    // File type icon based on extension
    const extension = file.name.split(".").pop()?.toLowerCase() || ""

    const getColorByExtension = () => {
      switch (extension) {
        case "pdf":
          return "bg-red-100 text-red-800"
        case "doc":
        case "docx":
          return "bg-blue-100 text-blue-800"
        case "xls":
        case "xlsx":
          return "bg-green-100 text-green-800"
        case "ppt":
        case "pptx":
          return "bg-orange-100 text-orange-800"
        case "txt":
          return "bg-gray-100 text-gray-800"
        case "zip":
        case "rar":
          return "bg-purple-100 text-purple-800"
        default:
          return "bg-muted text-muted-foreground"
      }
    }

    return (
      <div className={cn("h-full w-full flex items-center justify-center rounded-md", getColorByExtension())}>
        <span className="text-xs font-bold uppercase">{extension}</span>
      </div>
    )
  }

  return (
    <div className="relative group h-16 w-16">
      <div className="h-16 w-16 rounded-md overflow-hidden border">{getFileIcon()}</div>
      <Button
        variant="secondary"
        size="icon"
        className="h-5 w-5 absolute -top-2 -right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1 text-[8px] text-white text-center truncate">
        {file.name}
      </div>
    </div>
  )
}
