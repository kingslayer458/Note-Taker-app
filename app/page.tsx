"use client"

import { useState, useEffect } from "react"
import { getNotes, saveNote, deleteNote, updateNote, fetchAndMergeNotes, checkApiHealth, getFoldersLocally, getFoldersFromCloud, createFolderInCloud, deleteFolderInCloud, updateFolderInCloud, IS_CLOUD_ONLY } from "@/lib/storage"
import type { Note, Folder as FolderType } from "@/lib/types"
import Sidebar from "@/components/sidebar"
import NotesList from "@/components/notes-list"
import AddNote from "@/components/add-note"
import NoteView from "@/components/note-view"
import FolderDialog from "@/components/folder-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [view, setView] = useState<"list" | "add" | "view">("list")
  const [isLoading, setIsLoading] = useState(true)
  const [folderDialogState, setFolderDialogState] = useState<{
    isOpen: boolean;
    folderId?: string;
    initialData?: { name: string; color: string };
    resolve: ((value: FolderType | null) => void) | null;
  }>({ isOpen: false, resolve: null })
  
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<{
    isOpen: boolean;
    folderId: string | null;
  }>({ isOpen: false, folderId: null })
  
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
          const cloudFolders = await getFoldersFromCloud()
          setFolders(cloudFolders)
        } else {
          // Offline - use localStorage only
          const storedNotes = getNotes()
          setNotes(storedNotes)
          const localFolders = getFoldersLocally()
          setFolders(localFolders)
        }
      } catch (error) {
        console.error("Error loading notes:", error)
        // Fallback to localStorage
        const storedNotes = getNotes()
        setNotes(storedNotes)
        const localFolders = getFoldersLocally()
        setFolders(localFolders)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  // Handler for when sync completes - refresh notes from storage
  const handleSyncComplete = (syncedNotes: Note[], syncedFolders: FolderType[] = []) => {
    setNotes(syncedNotes)
    setFolders(syncedFolders)
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

  const handleAddNote = async (newNote: Note) => {
    try {
      const success = await saveNote(newNote)
      
      if (!success) {
        toast({ title: "Offline", description: "Cannot create notes while offline in Cloud-Only mode", variant: "destructive" })
        return
      }

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

  const handleDeleteNote = async (id: string) => {
    try {
      const success = await deleteNote(id)
      
      if (!success) {
        toast({ title: "Offline", description: "Cannot delete notes while offline in Cloud-Only mode", variant: "destructive" })
        return
      }

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

  const handleStartNoteCreation = () => {
    setView("add")
  }

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      const success = await updateNote(updatedNote)
      
      if (!success) {
        toast({ title: "Offline", description: "Cannot update notes while offline in Cloud-Only mode", variant: "destructive" })
        return
      }

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

  const handleMoveToFolder = (note: Note, folderId: string | null) => {
    handleUpdateNote({ ...note, folder_id: folderId })
  }

  const handleCreateFolder = (): Promise<FolderType | null> => {
    return new Promise((resolve) => {
      setFolderDialogState({ isOpen: true, resolve })
    })
  }

  const handleEditFolder = (folder: FolderType) => {
    setFolderDialogState({
      isOpen: true,
      folderId: folder.id,
      initialData: { name: folder.name, color: folder.color || "#fef3c7", icon_url: folder.icon_url },
      resolve: null
    })
  }

  const handleFolderSubmit = async (name: string, color: string, icon_url?: string) => {
    setFolderDialogState(prev => ({ ...prev, isOpen: false }))
    const { resolve, folderId } = folderDialogState
    
    try {
      let updatedFolder: FolderType | null = null;
      
      if (folderId) {
        updatedFolder = await updateFolderInCloud(folderId, name, color, icon_url)
        if (updatedFolder) {
          setFolders(prev => prev.map(f => f.id === folderId ? updatedFolder! : f))
          toast({ description: "Folder updated successfully" })
        }
      } else {
        updatedFolder = await createFolderInCloud(name, color, icon_url)
        if (updatedFolder) {
          setFolders(prev => [updatedFolder, ...prev])
          toast({ description: "Folder created successfully" })
        }
      }

      if (!updatedFolder) {
        toast({ title: "Error", description: `Cannot ${folderId ? 'edit' : 'create'} folders while offline in Cloud-Only mode`, variant: "destructive" })
        if (resolve) resolve(null)
        return
      }
      
      if (resolve) resolve(updatedFolder)
    } catch {
      toast({ title: "Error", description: `Failed to ${folderId ? 'update' : 'create'} folder`, variant: "destructive" })
      if (resolve) resolve(null)
    }
  }

  const handleDeleteFolderRequest = (folderId: string) => {
    setDeleteFolderConfirm({ isOpen: true, folderId })
  }

  const handleConfirmDeleteFolder = async () => {
    const folderId = deleteFolderConfirm.folderId
    setDeleteFolderConfirm({ isOpen: false, folderId: null })
    if (!folderId) return
    
    try {
      const success = await deleteFolderInCloud(folderId)
      
      if (!success && IS_CLOUD_ONLY) {
        toast({ title: "Offline", description: "Cannot delete folders while offline in Cloud-Only mode", variant: "destructive" })
        return
      }
      
      if (success) {
        setFolders(prev => prev.filter(f => f.id !== folderId))
        setNotes(prev => prev.map(n => n.folder_id === folderId ? { ...n, folder_id: null } : n))
        if (currentFolderId === folderId) {
          setCurrentFolderId(null)
        }
        toast({ description: "Folder deleted successfully" })
      } else {
        throw new Error("Failed to delete folder")
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete folder", variant: "destructive" })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        view={view} 
        setView={setView} 
        noteCount={notes.length} 
        onSyncComplete={handleSyncComplete}
        onCreateFolder={handleCreateFolder}
      />

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-20 md:pt-6 w-full">
        {view === "list" && (
          <NotesList
            notes={notes}
            folders={folders}
            currentFolderId={currentFolderId}
            onFolderClick={(id) => setCurrentFolderId(id)}
            onBackToRoot={() => setCurrentFolderId(null)}
            onCreateNote={handleStartNoteCreation}
            isLoading={isLoading}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
            onMoveToFolder={handleMoveToFolder}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolderRequest}
            onEditFolder={handleEditFolder}
          />
        )}

        {view === "add" && (
          <AddNote
            onAddNote={handleAddNote}
            folderId={currentFolderId}
            folderName={currentFolderId ? folders.find(folder => folder.id === currentFolderId)?.name || null : null}
          />
        )}

        {view === "view" && selectedNote && (
          <NoteView
            note={selectedNote}
            onBack={() => setView("list")}
            onDelete={() => handleDeleteNote(selectedNote.id)}
            onUpdate={(note) => handleUpdateNote(note)}
          />
        )}
      </main>

      <FolderDialog
        isOpen={folderDialogState.isOpen}
        initialData={folderDialogState.initialData}
        onClose={() => {
          setFolderDialogState(prev => ({ ...prev, isOpen: false }))
          if (folderDialogState.resolve) folderDialogState.resolve(null)
        }}
        onSubmit={handleFolderSubmit}
      />

      <AlertDialog 
        open={deleteFolderConfirm.isOpen} 
        onOpenChange={(isOpen) => !isOpen && setDeleteFolderConfirm({ isOpen: false, folderId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? Your notes inside will be kept safe and moved back to the main view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
