import type { Note } from "./types"

const STORAGE_KEY = "noteTaker.notes"

/**
 * Get all notes from localStorage
 */
export function getNotes(): Note[] {
  try {
    if (typeof window === "undefined") return []

    const notesJson = localStorage.getItem(STORAGE_KEY)
    return notesJson ? JSON.parse(notesJson) : []
  } catch (error) {
    console.error("Error retrieving notes from localStorage:", error)
    return [] // Return empty array instead of throwing
  }
}

/**
 * Save a new note to localStorage
 */
export async function saveNote(note: Note): Promise<void> {
  try {
    if (typeof window === "undefined") return

    // Simulate network delay for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 300))

    const notes = getNotes()
    const updatedNotes = [note, ...notes]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
  } catch (error) {
    console.error("Error saving note to localStorage:", error)
    throw new Error("Failed to save note to storage")
  }
}

/**
 * Delete a note from localStorage
 */
export async function deleteNote(id: string): Promise<void> {
  try {
    if (typeof window === "undefined") return

    // Simulate network delay for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 300))

    const notes = getNotes()
    const updatedNotes = notes.filter((note) => note.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
  } catch (error) {
    console.error("Error deleting note from localStorage:", error)
    throw new Error("Failed to delete note from storage")
  }
}
