"use client"

import { useState, useEffect } from "react"
import { getNotes, saveNote, deleteNote, updateNote, fetchAndMergeNotes, checkApiHealth } from "@/lib/storage"
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
    // Load notes - try to fetch from cloud first, fallback to localStorage
    const loadNotes = async () => {
      setIsLoading(true)
      try {
        // Check if backend is available
        const isOnline = await checkApiHealth()
        
        if (isOnline) {
          // Fetch and merge notes from cloud + localStorage
          const mergedNotes = await fetchAndMergeNotes()
          setNotes(mergedNotes)
        } else {
          // Offline - use localStorage only
          const storedNotes = getNotes()
          setNotes(storedNotes)
        }
      } catch (error) {
        console.error("Error loading notes:", error)
        // Fallback to localStorage
        const storedNotes = getNotes()
        setNotes(storedNotes)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  // Handler for when sync completes - refresh notes from storage
  const handleSyncComplete = (syncedNotes: Note[]) => {
    setNotes(syncedNotes)
    // Update selected note if it was updated
    if (selectedNote) {
      const updatedSelectedNote = syncedNotes.find(n => n.id === selectedNote.id)
      if (updatedSelectedNote) {
        setSelectedNote(updatedSelectedNote)
      } else {
        // Selected note was deleted in cloud
        setSelectedNote(null)
        if (view === "view") {
          setView("list")
        }
      }
    }
  }

  const handleAddNote = (newNote: Note) => {
    try {
      saveNote(newNote)
      setNotes((prevNotes) => [newNote, ...prevNotes])
      setView("list")

      toast({
        description: "Note saved successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = (id: string) => {
    try {
      deleteNote(id)
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setView("list")
      }
      toast({
        description: "Note deleted successfully",
      })
    } catch {
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

  const handleUpdateNote = (updatedNote: Note) => {
    try {
      // Persist change
      updateNote(updatedNote)

      // Update local state
      setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)))
      setSelectedNote(updatedNote)

      toast({
        description: "Note updated successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        view={view} 
        setView={setView} 
        noteCount={notes.length} 
        onSyncComplete={handleSyncComplete}
      />

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-20 md:pt-6 w-full">
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
            onUpdate={(note) => handleUpdateNote(note)}
          />
        )}
      </main>
    </div>
  )
}
