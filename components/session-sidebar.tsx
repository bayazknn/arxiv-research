"use client"

import { useState } from "react"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash, Download, Tag, MoreHorizontal } from "lucide-react"

export function SessionSidebar() {
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

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white p-2">
      <div className="flex items-center justify-between p-2 mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          onClick={() => handleCreateSession()}
          size="sm"
          variant="outline"
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-md cursor-pointer group",
              session.id === currentSessionId ? "bg-zinc-800" : "hover:bg-zinc-800",
            )}
            onClick={() => setCurrentSession(session.id)}
          >
            <div className="flex-1 truncate">
              <div className="truncate">{session.name}</div>
              {session.annotations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {session.annotations.map((annotation) => (
                    <Badge key={annotation.id} variant="outline" className={cn("text-xs", annotation.color)}>
                      {annotation.tags.join(", ")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenRename(session.id, session.name)
                    }}
                    className="hover:bg-zinc-700"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(session.id)
                    }}
                    className="hover:bg-zinc-700"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportSession(session.id)
                    }}
                    className="hover:bg-zinc-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenAnnotate(session.id)
                    }}
                    className="hover:bg-zinc-700"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Annotate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

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
