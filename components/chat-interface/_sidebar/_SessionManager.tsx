"use client";

import type { ChatSession } from "@/types/chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit3, Trash2, Download, MoreHorizontal, PlusCircle, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";

interface SessionManagerProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onCreateSession: () => ChatSession;
  onSelectSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSession: (sessionId: string) => void;
}

export function SessionManager({
  sessions,
  activeSessionId,
  onCreateSession,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onExportSession,
}: SessionManagerProps) {
  const { state: sidebarState } = useSidebar();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamingSession, setRenamingSession] = useState<ChatSession | null>(null);
  const [newSessionName, setNewSessionName] = useState("");

  const handleRenameClick = (session: ChatSession) => {
    setRenamingSession(session);
    setNewSessionName(session.name);
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (renamingSession && newSessionName.trim()) {
      onRenameSession(renamingSession.id, newSessionName.trim());
    }
    setIsRenameDialogOpen(false);
    setRenamingSession(null);
  };

  return (
    <>
      <SidebarHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-7 w-7 text-primary fill-current">
              <path
                d="M155.51,208H48a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,208,112v40h-8V112L144,56H48V200H155.51a8,8,0,0,1,5.66,2.34l36.49,36.49A8,8,0,0,1,200,246.83Z"
                opacity="0.2"
              />
              <path d="M208,104H152a8,8,0,0,1-8-8V40a8,8,0,0,0-8-8H48A16,16,0,0,0,32,48V200a16,16,0,0,0,16,16H192a15.87,15.87,0,0,0,11.31-4.69l32-32A16,16,0,0,0,240,168V112A8,8,0,0,0,208,104ZM48,48H136v56h56v40H118.63a8,8,0,0,0-5.66,2.34L80,182.63V152a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8h30.63a8,8,0,0,0,5.65-2.34L144,161.37V184a8,8,0,0,0,16,0V160a8,8,0,0,0-8-8H121.37a8,8,0,0,0-5.66,2.34L96,180.63V192a8,8,0,0,0,16,0v-2.63l12.93-12.93A40,40,0,0,0,176,160h32v8a.3.3,0,0,0,0,.05L205.31,210.7A1.62,1.62,0,0,1,204.17,211c-.1.05-.21.07-.32.12s-.23.09-.34.13L192,216H48Zm147.31,51.31L216,178.63V200h-21.37l-24-24H200a8,8,0,0,0,5.66-2.34ZM224,168l-32,32H163.31l32-32Zm-12.69-4.69L192,144h20.69Z" />
            </svg>
            {sidebarState === "expanded" && <h1 className="text-xl font-semibold text-foreground">NebulaChat</h1>}
          </div>
          {sidebarState === "expanded" && (
            <Button variant="ghost" size="icon" onClick={onCreateSession} aria-label="New Chat">
              <PlusCircle size={20} />
            </Button>
          )}
        </div>
        {sidebarState === "collapsed" && (
          <div className="mt-2">
            <Button variant="ghost" size="icon" className="w-full h-8" onClick={onCreateSession} aria-label="New Chat">
              <PlusCircle size={20} />
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          <SidebarMenu className={cn("p-2", sidebarState === "collapsed" && "items-center")}>
            {sessions.map((session) => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  onClick={() => onSelectSession(session.id)}
                  isActive={session.id === activeSessionId}
                  variant="ghost"
                  className={cn("w-full justify-start", sidebarState === "collapsed" && "justify-center w-10 h-10 p-0")}
                  tooltip={sidebarState === "collapsed" ? session.name : undefined}>
                  <MessageSquareText size={18} />
                  {sidebarState === "expanded" && <span className="truncate flex-1">{session.name}</span>}
                </SidebarMenuButton>
                {sidebarState === "expanded" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal size={16} />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right" sideOffset={5}>
                      <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExportSession(session.id)}>
                        <Download className="mr-2 h-4 w-4" /> Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                        onClick={() => onDeleteSession(session.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </SidebarMenuItem>
            ))}
            {sessions.length === 0 && sidebarState === "expanded" && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No sessions yet. Click "New Chat" to start.
              </div>
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      {/* SidebarFooter can be used for settings or user profile later */}
      {/* <SidebarFooter className="p-2 border-t">
        <p className="text-xs text-muted-foreground">© NebulaChat</p>
      </SidebarFooter> */}

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionNameModal" className="text-right">
                Name
              </Label>
              <Input
                id="sessionNameModal"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleRenameSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
