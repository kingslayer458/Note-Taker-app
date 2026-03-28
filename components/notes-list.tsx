"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Note } from "@/lib/types"
import NoteCard from "@/components/note-card"

interface NotesListProps {
  notes: Note[]
  isLoading: boolean
  onSelectNote: (note: Note) => void
  onDeleteNote: (id: string) => void
}

export default function NotesList({ notes, isLoading, onSelectNote, onDeleteNote }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">No notes yet. Create your first note!</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">No notes match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pb-8">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => onSelectNote(note)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
