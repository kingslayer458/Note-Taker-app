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

function normalizeBackupNote(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") return null

  const note = raw as Partial<Note>
  const title = typeof note.title === "string" && note.title.trim().length > 0 ? note.title.trim() : "Untitled Note"
  const content = typeof note.content === "string" ? note.content : "No content"
  const color = typeof note.color === "string" && note.color.trim().length > 0 ? note.color : "#6366f1"
  const createdAt = typeof note.createdAt === "string" && !Number.isNaN(Date.parse(note.createdAt))
    ? note.createdAt
    : new Date().toISOString()

  let id = typeof note.id === "string" && note.id.trim().length > 0 ? note.id.trim() : ""
  if (!id) {
    id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  return {
    id,
    title,
    content,
    color,
    createdAt,
  }
}

/**
 * Create a JSON backup string of all notes in localStorage
 */
export function createNotesBackup(): { success: boolean; data?: string; message: string } {
  try {
    const notes = getNotes()

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes,
    }

    return {
      success: true,
      data: JSON.stringify(payload, null, 2),
      message: `Backup created with ${notes.length} notes`,
    }
  } catch (error) {
    console.error("Error creating backup:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create backup",
    }
  }
}

/**
 * Restore notes from backup JSON and merge with existing notes
 */
export function restoreNotesFromBackup(
  backupJson: string,
): { success: boolean; message: string; notes: Note[] } {
  try {
    const parsed = JSON.parse(backupJson) as unknown

    let rawNotes: unknown[] = []
    if (Array.isArray(parsed)) {
      rawNotes = parsed
    } else if (
      parsed &&
      typeof parsed === "object" &&
      "notes" in parsed &&
      Array.isArray((parsed as { notes: unknown[] }).notes)
    ) {
      rawNotes = (parsed as { notes: unknown[] }).notes
    } else {
      throw new Error("Invalid backup JSON format")
    }

    const restoredNotes = rawNotes
      .map(normalizeBackupNote)
      .filter((note): note is Note => note !== null)

    if (restoredNotes.length === 0) {
      throw new Error("Backup file does not contain valid notes")
    }

    const existingNotes = getNotes()
    const notesMap = new Map<string, Note>()

    for (const note of existingNotes) {
      notesMap.set(note.id, note)
    }

    for (const note of restoredNotes) {
      notesMap.set(note.id, note)
    }

    const mergedNotes = Array.from(notesMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedNotes))

    return {
      success: true,
      message: `Restored ${restoredNotes.length} notes locally`,
      notes: mergedNotes,
    }
  } catch (error) {
    console.error("Error restoring backup:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to restore backup",
      notes: getNotes(),
    }
  }
}
