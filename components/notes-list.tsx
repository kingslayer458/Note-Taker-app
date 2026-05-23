"use client"

import { useState } from "react"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Trash2, Pencil, Folder as FolderIcon } from "lucide-react"

export const PremiumFolderIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 28C12 23.5817 15.5817 20 20 20H37.1716C39.2933 20 41.328 20.8429 42.8284 22.3431L48.1716 27.6569C49.672 29.1571 51.7067 30 53.8284 30H80C84.4183 30 88 33.5817 88 38V80C88 84.4183 84.4183 88 80 88H20C15.5817 88 12 84.4183 12 80V28Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M10 42C10 37.5817 13.5817 34 18 34H82C86.4183 34 90 37.5817 90 42V80C90 84.4183 86.4183 88 82 88H18C13.5817 88 10 84.4183 10 80V42Z" fill="currentColor" fillOpacity="0.95"/>
    <path d="M18 34H82C86.4183 34 90 37.5817 90 42V44C90 39.5817 86.4183 36 82 36H18C13.5817 36 10 39.5817 10 44V42C10 37.5817 13.5817 34 18 34Z" fill="#ffffff" fillOpacity="0.5"/>
  </svg>
)
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Note, Folder as FolderType } from "@/lib/types"
import NoteCard from "@/components/note-card"

interface NotesListProps {
  notes: Note[]
  folders?: FolderType[]
  currentFolderId?: string | null
  onFolderClick?: (id: string) => void
  onBackToRoot?: () => void
  isLoading: boolean
  onSelectNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onMoveToFolder?: (note: Note, folderId: string | null) => void
  onCreateFolder?: () => Promise<FolderType | null>
  onDeleteFolder?: (id: string) => void
  onEditFolder?: (folder: FolderType) => void
}

export default function NotesList({ 
  notes, 
  folders = [], 
  currentFolderId = null,
  onFolderClick,
  onBackToRoot,
  isLoading, 
  onSelectNote, 
  onDeleteNote, 
  onMoveToFolder,
  onCreateFolder,
  onDeleteFolder,
  onEditFolder
}: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const isSearching = searchQuery.trim().length > 0

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    // If searching from root view, search all notes globally.
    // Otherwise, restrict to the current view (specific folder or root).
    const matchesFolder = (isSearching && !currentFolderId) 
      ? true 
      : (currentFolderId ? note.folder_id === currentFolderId : !note.folder_id)
      
    return matchesSearch && matchesFolder
  })

  const filteredFolders = folders.filter((folder) => {
    return folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  })
  
  const currentFolderName = currentFolderId ? folders.find(f => f.id === currentFolderId)?.name || "Folder" : ""

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading your notes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3">
        {currentFolderId && onBackToRoot && (
          <Button variant="outline" size="icon" onClick={onBackToRoot} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={currentFolderId ? `Search in ${currentFolderName}...` : "Search notes & folders..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {currentFolderId && (
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FolderIcon className="h-5 w-5 text-primary" />
          {currentFolderName}
        </h2>
      )}

      {(!currentFolderId && filteredFolders.length === 0 && filteredNotes.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">No notes or folders yet. Create your first note!</p>
        </div>
      ) : (currentFolderId && filteredNotes.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">This folder is empty</p>
        </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[minmax(220px,_auto)] gap-3 sm:gap-4 overflow-y-auto pb-8 content-start">
          
          {!currentFolderId && filteredFolders.map((folder) => {
            let bgColor = folder.color || "#2563eb";
            // Migrate old pastels if they exist
            if (bgColor === "#fef3c7") bgColor = "#d97706";
            if (bgColor === "#e0f2fe") bgColor = "#2563eb";
            if (bgColor === "#d1fae5") bgColor = "#059669";
            if (bgColor === "#fee2e2") bgColor = "#e11d48";
            if (bgColor === "#f3e8ff") bgColor = "#7c3aed";
            if (bgColor === "#f1f5f9") bgColor = "#475569";
            
            return (
              <Card
                key={folder.id}
                className="h-[220px] cursor-pointer overflow-hidden transition-all duration-200 active:scale-[0.98] relative flex flex-col justify-center items-center group bg-transparent border-0 shadow-none hover:bg-accent/30"
                onClick={() => onFolderClick?.(folder.id)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center w-full h-full">
                  <div className="flex-1 w-full flex items-center justify-center mb-1 mt-1">
                    {folder.icon_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={folder.icon_url} 
                        alt="Folder icon" 
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300" 
                      />
                    ) : (
                      <PremiumFolderIcon 
                        className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xl group-hover:scale-110 transition-transform duration-300" 
                        style={{ color: bgColor }} 
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl line-clamp-1 text-foreground">{folder.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    {notes.filter(n => n.folder_id === folder.id).length} notes
                  </p>
                </CardContent>
              {(onDeleteFolder || onEditFolder) && (
                <div className="absolute bottom-2 right-2 flex gap-1 transition-opacity opacity-0 group-hover:opacity-100">
                  {onEditFolder && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditFolder(folder)
                      }}
                      className="h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-accent"
                      title="Edit folder"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteFolder && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteFolder(folder.id)
                      }}
                      className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      title="Delete folder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              </Card>
            )
          })}

          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              folders={folders}
              onClick={() => onSelectNote(note)}
              onDelete={() => onDeleteNote(note.id)}
              onMoveToFolder={onMoveToFolder ? (folderId) => onMoveToFolder(note, folderId) : undefined}
              onCreateFolder={onCreateFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}
