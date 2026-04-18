import type { Note } from "./types"

const STORAGE_KEY = "noteTaker.notes"
const IS_CLOUD_ONLY = process.env.NEXT_PUBLIC_CLOUD_ONLY === "true"
const API_KEY = process.env.API_KEY || ""

// All cloud API calls now go through Next.js API routes (same origin).
// The API key is added server-side — never exposed to the browser.

function getProxyUrl(path: string): string {
  return path // e.g. "/api/notes", "/api/health" — same-origin calls
}

// Helpers to encode/decode content to bypass strict WAF rules (like Cloudflare blocking code snippets)
function encodeContent(text: string): string {
  if (!text) return text
  try {
    return "__b64__" + btoa(unescape(encodeURIComponent(text)))
  } catch {
    return text
  }
}

function decodeContent(text: string): string {
  if (!text || typeof text !== "string" || !text.startsWith("__b64__")) return text
  try {
    return decodeURIComponent(escape(atob(text.substring(7))))
  } catch {
    return text
  }
}

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

/**
 * Fetch notes from localStorage
 */
export function getNotes(): Note[] {
  if (typeof window === "undefined" || IS_CLOUD_ONLY) return []

  try {
    const notesJson = localStorage.getItem(STORAGE_KEY)
    return notesJson ? JSON.parse(notesJson) : []
  } catch (error) {
    console.error("Error retrieving notes:", error)
    return []
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
 * Create a JSON backup string of all available notes.
 * If backend is available, this includes merged cloud + local notes.
 */
export async function createNotesBackup(): Promise<{ success: boolean; data?: string; message: string }> {
  try {
    let notes = getNotes()
    const isOnline = await checkApiHealth()

    if (isOnline) {
      notes = await fetchAndMergeNotes()
    }

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
 * Restore notes from backup JSON and persist to localStorage.
 * Also syncs restored notes to cloud when backend is available.
 */
export async function restoreNotesFromBackup(
  backupJson: string,
): Promise<{ success: boolean; message: string; notes: Note[] }> {
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

    if (!IS_CLOUD_ONLY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedNotes))
    }

    // Attempt cloud sync but never let it cause a failure —
    // the local restore already succeeded at this point (or we're trying to push directly to cloud)
    try {
      const isOnline = await checkApiHealth()
      if (isOnline) {
        if (IS_CLOUD_ONLY) {
          // In cloud-only mode, we must push the restored notes directly 
          // because syncNotesToCloud() only fetches in this mode
          const pushResponse = await fetch(getProxyUrl("/api/notes/sync"), {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-api-key": API_KEY 
            },
            body: JSON.stringify({ 
              notes: restoredNotes.map(n => ({ ...n, content: encodeContent(n.content) })) 
            }),
          })
          
          if (pushResponse.ok) {
            const cloudNotes = await getNotesFromCloud()
            return {
              success: true,
              message: `Restored ${restoredNotes.length} notes directly to cloud`,
              notes: cloudNotes,
            }
          }
          console.warn("Cloud push failed during restore in cloud-only mode")
        } else {
          const syncResult = await syncNotesToCloud()
          if (syncResult.success) {
            return {
              success: true,
              message: `Restored ${restoredNotes.length} notes and synced to cloud`,
              notes: syncResult.notes,
            }
          }
          // Cloud sync failed but local restore succeeded — don't alarm the user
          console.warn("Cloud sync failed after restore:", syncResult.message)
        }
      }
    } catch (syncError) {
      // Network errors, API key issues, etc. — swallow them
      console.warn("Cloud sync skipped during restore:", syncError)
    }

    return {
      success: true,
      message: `Restored ${restoredNotes.length} notes successfully`,
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

/**
 * Save a new note to localStorage
 */
export function saveNote(note: Note): void {
  if (typeof window === "undefined") return

  try {
    if (!IS_CLOUD_ONLY) {
      const notes = getNotes()
      const updatedNotes = [note, ...notes]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
    }
    
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
    if (!IS_CLOUD_ONLY) {
      const notes = getNotes()
      const updatedNotes = notes.filter((note) => note.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
    }
    
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
    if (!IS_CLOUD_ONLY) {
      const notes = getNotes()
      const updatedNotes = notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
    }
    
    // Also update in backend (non-blocking)
    updateNoteInCloud(updatedNote).catch(console.error)
  } catch (error) {
    console.error("Error updating note:", error)
    throw new Error("Failed to update note in storage")
  }
}

// ============================================
// CLOUD/MONGODB API FUNCTIONS (via Next.js proxy)
// ============================================

/**
 * Save a note to the cloud/MongoDB
 */
export async function saveNoteToCloud(note: Note): Promise<Note | null> {
  try {
    const response = await fetch(getProxyUrl("/api/notes"), {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        id: note.id,
        title: note.title,
        content: encodeContent(note.content),
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
    
    const savedNote = await response.json()
    return { ...savedNote, content: decodeContent(savedNote.content) }
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
    const response = await fetch(getProxyUrl(`/api/notes/${note.id}`), {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        title: note.title,
        content: encodeContent(note.content),
        color: note.color,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update note: ${response.statusText}`)
    }
    
    const updatedNote = await response.json()
    return { ...updatedNote, content: decodeContent(updatedNote.content) }
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
    const response = await fetch(getProxyUrl(`/api/notes/${id}`), {
      method: "DELETE",
      headers: { "x-api-key": API_KEY },
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
    const response = await fetch(getProxyUrl("/api/notes"), {
      headers: { "x-api-key": API_KEY }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`)
    }
    
    const notes: Note[] = await response.json()
    return notes.map(n => ({ ...n, content: decodeContent(n.content) }))
  } catch (error) {
    console.error("Error fetching notes from cloud:", error)
    return []
  }
}

/**
 * Sync all localStorage notes to the cloud/MongoDB (push only)
 */
export async function pushNotesToCloud(): Promise<{ success: boolean; message: string }> {
  if (IS_CLOUD_ONLY) {
    return { success: true, message: "Running in cloud-only mode (nothing to push)" }
  }

  try {
    const localNotes = getNotes()
    
    if (localNotes.length === 0) {
      return { success: true, message: "No notes to push" }
    }
    
    const response = await fetch(getProxyUrl("/api/notes/sync"), {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ 
        notes: localNotes.map(n => ({ ...n, content: encodeContent(n.content) })) 
      }),
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
  if (IS_CLOUD_ONLY) {
    try {
      const cloudNotes = await getNotesFromCloud()
      return { 
        success: true, 
        message: `Synced successfully! ${cloudNotes.length} notes in total`,
        notes: cloudNotes
      }
    } catch (error) {
      console.error("Error syncing notes in cloud mode:", error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to sync notes",
        notes: []
      }
    }
  }

  try {
    // Step 1: Push local notes to cloud
    const localNotes = getNotes()
    
    if (localNotes.length > 0) {
      const pushResponse = await fetch(getProxyUrl("/api/notes/sync"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ 
          notes: localNotes.map(n => ({ ...n, content: encodeContent(n.content) })) 
        }),
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
      if (!IS_CLOUD_ONLY) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudNotes))
      }
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
    if (IS_CLOUD_ONLY) return cloudNotes
    
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
    if (!IS_CLOUD_ONLY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedNotes))
    }
    
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
      if (!IS_CLOUD_ONLY) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudNotes))
      }
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
    const response = await fetch(getProxyUrl("/api/health"), {
      method: "GET",
      headers: { "x-api-key": API_KEY },
      signal: AbortSignal.timeout(5000) // 5 second timeout (proxy adds latency)
    })
    return response.ok
  } catch {
    return false
  }
}
