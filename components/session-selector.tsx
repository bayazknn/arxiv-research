"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@/contexts/chat-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, Plus, Edit, Trash, Download, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function SessionSelector() {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    renameSession,
    exportSession,
    setCurrentSession,
    annotateSession,
  } = useChat()

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [annotation, setAnnotation] = useState({ text: "", tags: [""] })
  const [sessionToModify, setSessionToModify] = useState<string | null>(null)

  const currentSession = sessions.find((session) => session.id === currentSessionId)

  const handleCreateSession = () => {
    createSession()
  }

  const handleOpenRename = (id: string, name: string) => {
    setSessionToModify(id)
    setNewName(name)
    setIsRenameOpen(true)
  }

  const handleRenameSession = () => {
    if (sessionToModify && newName.trim()) {
      renameSession(sessionToModify, newName)
      setIsRenameOpen(false)
      setNewName("")
      setSessionToModify(null)
    }
  }

  const handleDeleteSession = (id: string) => {
    deleteSession(id)
  }

  const handleExportSession = (id: string) => {
    const jsonData = exportSession(id)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-session-${id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenAnnotate = (id: string) => {
    setSessionToModify(id)
    setIsAnnotateOpen(true)
  }

  const handleSaveAnnotation = () => {
    if (sessionToModify) {
      annotateSession(sessionToModify, {
        text: annotation.text,
        tags: annotation.tags.filter(Boolean),
        color: getRandomColor(),
      })
      setIsAnnotateOpen(false)
      setAnnotation({ text: "", tags: [""] })
      setSessionToModify(null)
    }
  }

  const handleAddTag = () => {
    setAnnotation((prev) => ({
      ...prev,
      tags: [...prev.tags, ""],
    }))
  }

  const handleTagChange = (index: number, value: string) => {
    setAnnotation((prev) => {
      const newTags = [...prev.tags]
      newTags[index] = value
      return { ...prev, tags: newTags }
    })
  }

  const getRandomColor = () => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Prevent event handlers from being called during render
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            {currentSession ? currentSession.name : "Select Session"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          {sessions.map((session) => (
            <DropdownMenuItem
              key={session.id}
              onSelect={() => setCurrentSession(session.id)}
              className="flex flex-col items-start"
            >
              <div className="flex w-full justify-between items-center">
                <span className="truncate">{session.name}</span>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenRename(session.id, session.name)
                    }}
                    type="button"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(session.id)
                    }}
                    type="button"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {session.annotations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {session.annotations.map((annotation) => (
                    <Badge key={annotation.id} variant="outline" className={cn("text-xs", annotation.color)}>
                      {annotation.tags.join(", ")}
                    </Badge>
                  ))}
                </div>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleCreateSession}>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </DropdownMenuItem>
          {currentSession && (
            <>
              <DropdownMenuItem
                onSelect={() => {
                  if (currentSession) {
                    handleExportSession(currentSession.id)
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Session
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  if (currentSession) {
                    handleOpenAnnotate(currentSession.id)
                  }
                }}
              >
                <Tag className="mr-2 h-4 w-4" />
                Annotate Session
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={() => handleCreateSession()} size="icon" variant="outline" type="button">
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Session Name</Label>
            <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)} type="button">
              Cancel
            </Button>
            <Button onClick={() => handleRenameSession()} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnnotateOpen} onOpenChange={setIsAnnotateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Session Annotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="annotation">Annotation</Label>
              <Textarea
                id="annotation"
                placeholder="Add your notes here..."
                value={annotation.text}
                onChange={(e) => setAnnotation((prev) => ({ ...prev, text: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              {annotation.tags.map((tag, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input placeholder="Enter tag" value={tag} onChange={(e) => handleTagChange(index, e.target.value)} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddTag()}>
                Add Tag
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnotateOpen(false)} type="button">
              Cancel
            </Button>
            <Button onClick={() => handleSaveAnnotation()} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
