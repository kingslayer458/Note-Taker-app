"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Folder } from "lucide-react"
import type { Note, Folder as FolderType } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PremiumFolderIcon } from "@/components/notes-list"

interface NoteCardProps {
  note: Note
  folders?: FolderType[]
  onClick: () => void
  onDelete: () => void
  onMoveToFolder?: (folderId: string | null) => void
  onCreateFolder?: () => Promise<FolderType | null>
}

export default function NoteCard({ note, folders = [], onClick, onDelete, onMoveToFolder, onCreateFolder }: NoteCardProps) {
  // Truncate content for preview
  const truncatedContent = note.content.length > 150 ? note.content.substring(0, 150) + "..." : note.content

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const currentFolder = note.folder_id ? folders.find(f => f.id === note.folder_id) : null;

  return (
    <Card
      className="h-full min-h-[220px] cursor-pointer overflow-hidden border-t-4 hover:shadow-md transition-all duration-200 active:scale-[0.98] relative flex flex-col"
      style={{ borderTopColor: note.color || "#6366f1" }}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5 flex-1 pb-12">
        <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-1">{note.title}</h3>
        <div className="flex items-center flex-wrap gap-2 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(note.createdAt)}</p>
          {currentFolder && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border"
              style={{ 
                backgroundColor: `${currentFolder.color || '#6366f1'}15`, 
                color: currentFolder.color || '#6366f1',
                borderColor: `${currentFolder.color || '#6366f1'}30`
              }}
            >
              {currentFolder.icon_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={currentFolder.icon_url} alt="Folder icon" className="w-3 h-3 object-contain" />
              ) : (
                <PremiumFolderIcon className="w-3 h-3" style={{ color: currentFolder.color || '#6366f1' }} />
              )}
              {currentFolder.name}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm line-clamp-3 sm:line-clamp-4 whitespace-pre-wrap">{truncatedContent}</p>
      </CardContent>

      <div className="absolute bottom-2 right-2 flex gap-1">
        {onMoveToFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                title="Organize in folder"
              >
                <Folder className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onClick={(e) => e.stopPropagation()}
              className="max-h-[600px] overflow-y-auto overflow-x-hidden pr-1 scrollbar-none"
            >
              {note.folder_id && (
                <DropdownMenuItem 
                  onClick={() => onMoveToFolder(null)}
                >
                  Root (No Folder)
                </DropdownMenuItem>
              )}
              {onCreateFolder && (
                <DropdownMenuItem 
                  onClick={async () => {
                    const newFolder = await onCreateFolder()
                    if (newFolder) {
                      onMoveToFolder(newFolder.id)
                    }
                  }}
                  className="text-primary font-medium"
                >
                  + Create New Folder
                </DropdownMenuItem>
              )}
              {folders.filter(f => f.id !== note.folder_id).map(f => {
                let bgColor = f.color || "#6366f1";
                // Migrate old pastels if they exist
                if (bgColor === "#fef3c7") bgColor = "#d97706";
                if (bgColor === "#e0f2fe") bgColor = "#2563eb";
                if (bgColor === "#d1fae5") bgColor = "#059669";
                if (bgColor === "#fee2e2") bgColor = "#e11d48";
                if (bgColor === "#f3e8ff") bgColor = "#7c3aed";
                if (bgColor === "#f1f5f9") bgColor = "#475569";
                
                return (
                  <DropdownMenuItem 
                    key={f.id} 
                    onClick={() => onMoveToFolder(f.id)}
                    className="flex items-center"
                  >
                    {f.icon_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={f.icon_url} alt="Folder icon" className="w-4 h-4 mr-2 object-contain" />
                    ) : (
                      <PremiumFolderIcon className="w-4 h-4 mr-2" style={{ color: bgColor }} />
                    )}
                    {f.name}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
