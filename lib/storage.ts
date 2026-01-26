import type { Note } from "./types"

const STORAGE_KEY = "noteTaker.notes"

/**
 * Fetch notes from localStorage
 */
export function getNotes(): Note[] {
  if (typeof window === "undefined") return []

  try {
    const notesJson = localStorage.getItem(STORAGE_KEY)
    return notesJson ? JSON.parse(notesJson) : []
  } catch (error) {
    console.error("Error retrieving notes:", error)
    return []
  }
}

/**
 * Save a new note to localStorage
 */
export function saveNote(note: Note): void {
  if (typeof window === "undefined") return

  try {
    const notes = getNotes()
    const updatedNotes = [note, ...notes]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
  } catch (error) {
    console.error("Error saving note:", error)
    throw new Error("Failed to save note to storage")
  }
}

/**
 * Delete a note from localStorage
 */
export function deleteNote(id: string): void {
  if (typeof window === "undefined") return

  try {
    const notes = getNotes()
    const updatedNotes = notes.filter((note) => note.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
  } catch (error) {
    console.error("Error deleting note:", error)
    throw new Error("Failed to delete note from storage")
  }
}

/**
 * Update an existing note in localStorage
 */
export function updateNote(updatedNote: Note): void {
  if (typeof window === "undefined") return

  try {
    const notes = getNotes()
    const updatedNotes = notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
  } catch (error) {
    console.error("Error updating note:", error)
    throw new Error("Failed to update note in storage")
  }
}
