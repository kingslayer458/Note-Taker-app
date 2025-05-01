"use client"

import { useState, useEffect } from "react"
import { getNotes, saveNote, deleteNote } from "@/lib/storage"
import type { Note } from "@/lib/types"
import Sidebar from "@/components/sidebar"
import NotesList from "@/components/notes-list"
import AddNote from "@/components/add-note"
import NoteView from "@/components/note-view"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [view, setView] = useState<"list" | "add" | "view">("list")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load notes from localStorage on mount
    try {
      const storedNotes = getNotes()
      setNotes(storedNotes)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load notes from storage",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleAddNote = async (newNote: Note) => {
    try {
      await saveNote(newNote)
      setNotes((prevNotes) => [newNote, ...prevNotes])
      setView("list")

      toast({
        description: "Note saved successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id)
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setView("list")
      }
      toast({
        description: "Note deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setView("view")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar view={view} setView={setView} noteCount={notes.length} />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        {view === "list" && (
          <NotesList
            notes={notes}
            isLoading={isLoading}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {view === "add" && <AddNote onAddNote={handleAddNote} />}

        {view === "view" && selectedNote && (
          <NoteView
            note={selectedNote}
            onBack={() => setView("list")}
            onDelete={() => handleDeleteNote(selectedNote.id)}
          />
        )}
      </main>
    </div>
  )
}
