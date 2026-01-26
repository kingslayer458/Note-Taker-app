import type { Note } from "./types"

const STORAGE_KEY = "noteTaker.notes"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

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
    
    // Also save to backend (non-blocking)
    saveNoteToCloud(note).catch(console.error)
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
    
    // Also delete from backend (non-blocking)
    deleteNoteFromCloud(id).catch(console.error)
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
    
    // Also update in backend (non-blocking)
    updateNoteInCloud(updatedNote).catch(console.error)
  } catch (error) {
    console.error("Error updating note:", error)
    throw new Error("Failed to update note in storage")
  }
}

// ============================================
// CLOUD/MONGODB API FUNCTIONS
// ============================================

/**
 * Save a note to the cloud/MongoDB
 */
export async function saveNoteToCloud(note: Note): Promise<Note | null> {
  try {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        createdAt: note.createdAt,
      }),
    })
    
    if (!response.ok) {
      // If note already exists (409 conflict), try updating instead
      if (response.status === 409) {
        return updateNoteInCloud(note)
      }
      throw new Error(`Failed to save note: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error saving note to cloud:", error)
    return null
  }
}

/**
 * Update a note in the cloud/MongoDB
 */
export async function updateNoteInCloud(note: Note): Promise<Note | null> {
  try {
    const response = await fetch(`${API_URL}/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: note.title,
        content: note.content,
        color: note.color,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update note: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error updating note in cloud:", error)
    return null
  }
}

/**
 * Delete a note from the cloud/MongoDB
 */
export async function deleteNoteFromCloud(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: "DELETE",
    })
    
    // 204 No Content or 404 Not Found are both acceptable
    return response.ok || response.status === 404
  } catch (error) {
    console.error("Error deleting note from cloud:", error)
    return false
  }
}

/**
 * Fetch all notes from the cloud/MongoDB
 */
export async function getNotesFromCloud(): Promise<Note[]> {
  try {
    const response = await fetch(`${API_URL}/api/notes`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching notes from cloud:", error)
    return []
  }
}

/**
 * Sync all localStorage notes to the cloud/MongoDB (push only)
 */
export async function pushNotesToCloud(): Promise<{ success: boolean; message: string }> {
  try {
    const localNotes = getNotes()
    
    if (localNotes.length === 0) {
      return { success: true, message: "No notes to push" }
    }
    
    const response = await fetch(`${API_URL}/api/notes/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: localNotes }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to sync notes: ${response.statusText}`)
    }
    
    const result = await response.json()
    return { 
      success: true, 
      message: `Successfully pushed ${result.synced_count} notes to cloud` 
    }
  } catch (error) {
    console.error("Error pushing notes to cloud:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to push notes" 
    }
  }
}

/**
 * Full two-way sync: Push local notes to cloud, then pull cloud notes to localStorage
 * Returns the merged notes array
 */
export async function syncNotesToCloud(): Promise<{ success: boolean; message: string; notes: Note[] }> {
  try {
    // Step 1: Push local notes to cloud
    const localNotes = getNotes()
    
    if (localNotes.length > 0) {
      const pushResponse = await fetch(`${API_URL}/api/notes/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: localNotes }),
      })
      
      if (!pushResponse.ok) {
        throw new Error(`Failed to push notes: ${pushResponse.statusText}`)
      }
    }
    
    // Step 2: Fetch all notes from cloud (includes any added directly to MongoDB)
    const cloudNotes = await getNotesFromCloud()
    
    // Step 3: Update localStorage with cloud notes (cloud is source of truth after sync)
    if (cloudNotes.length > 0) {
      // Sort by createdAt descending
      cloudNotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudNotes))
    }
    
    return { 
      success: true, 
      message: `Synced successfully! ${cloudNotes.length} notes in total`,
      notes: cloudNotes
    }
  } catch (error) {
    console.error("Error syncing notes:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sync notes",
      notes: getNotes() // Return local notes on failure
    }
  }
}

/**
 * Fetch notes from cloud and merge with localStorage
 * Cloud notes take precedence for conflicts
 */
export async function fetchAndMergeNotes(): Promise<Note[]> {
  try {
    const cloudNotes = await getNotesFromCloud()
    const localNotes = getNotes()
    
    // Create map for easy lookup of cloud notes
    const cloudNotesMap = new Map(cloudNotes.map(note => [note.id, note]))
    
    // Start with all cloud notes (they are the source of truth for existing notes)
    const mergedNotes: Note[] = [...cloudNotes]
    
    // Add local-only notes (notes that exist in local but not in cloud)
    for (const localNote of localNotes) {
      if (!cloudNotesMap.has(localNote.id)) {
        // Local-only note, add to merged and sync to cloud
        mergedNotes.push(localNote)
        saveNoteToCloud(localNote).catch(console.error)
      }
    }
    
    // Sort by createdAt descending
    mergedNotes.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Update localStorage with merged notes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedNotes))
    
    return mergedNotes
  } catch (error) {
    console.error("Error fetching and merging notes:", error)
    // Fall back to local notes
    return getNotes()
  }
}

/**
 * Pull notes from cloud only (one-way: cloud -> local)
 * This will overwrite local with cloud data
 */
export async function pullNotesFromCloud(): Promise<Note[]> {
  try {
    const cloudNotes = await getNotesFromCloud()
    
    if (cloudNotes.length > 0) {
      // Sort by createdAt descending
      cloudNotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      // Overwrite localStorage with cloud notes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudNotes))
    }
    
    return cloudNotes
  } catch (error) {
    console.error("Error pulling notes from cloud:", error)
    return getNotes()
  }
}

/**
 * Check if the backend API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(3000) // 3 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}
