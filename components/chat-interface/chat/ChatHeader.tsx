"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit3, Trash2, Download, MoreVertical, Save, PanelLeft, Plus } from "lucide-react";
import { useState } from "react";
import type { ChatSession } from "@/types/chat";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  sessions: ChatSession[] | undefined;
  session: ChatSession | undefined;
  onCreateSession: () => ChatSession;
  onSetActiveSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSession: (sessionId: string) => void;
}

export function ChatHeader({
  sessions,
  session,
  onCreateSession,
  onSetActiveSession,
  onRenameSession,
  onDeleteSession,
  onExportSession,
}: ChatHeaderProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState(session?.name || "");
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (!session) {
    return (
      <div className="p-4 border-b h-[60px] flex items-center justify-center bg-muted/50">
        {isMobile === false && ( // Show hamburger on desktop even when no session
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar" className="mr-2">
            <PanelLeft size={20} />
          </Button>
        )}
        <p className="text-sm text-muted-foreground">No active session</p>
      </div>
    );
  }

  const handleRename = () => {
    if (newSessionName.trim() && newSessionName !== session.name) {
      onRenameSession(session.id, newSessionName.trim());
    }
    setIsRenameDialogOpen(false);
  };

  return (
    <>
      <div className="p-4 border-b h-[60px] flex items-center justify-between bg-background shadow-sm">
        <div className="flex flex-row items-center gap-5">
          {" "}
          {/* Adjusted gap for hamburger */}
          {isMobile === false && ( // Only show hamburger on desktop (isMobile will be false)
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar" className="mr-1">
              <PanelLeft size={20} />
            </Button>
          )}
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sessions</SelectLabel>
                {sessions?.map((ss, i) => (
                  <SelectItem key={`si-${i}`} value={ss.name}>
                    {ss.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <h2 className="text-lg justify-center font-semibold truncate" title={session.name}>
            {session.name}
          </h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Session actions">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const newSession = onCreateSession();
                // onSetActiveSession(newSession.id);
              }}>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setNewSessionName(session.name);
                setIsRenameDialogOpen(true);
              }}>
              <Edit3 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportSession(session.id)}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
              onClick={() => onDeleteSession(session.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionName" className="text-right">
                Name
              </Label>
              <Input
                id="sessionName"
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
            <Button type="submit" onClick={handleRename}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
