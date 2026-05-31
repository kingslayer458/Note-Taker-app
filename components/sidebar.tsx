"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PenLine, List, Moon, Sun, Menu, X, Cloud, CloudOff, RefreshCw, Download, Upload, Database, LogOut, FolderPlus } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { syncNotesToCloud, checkApiHealth, createNotesBackup, restoreNotesFromBackup } from "@/lib/storage"
import type { Note, Folder } from "@/lib/types"

const IS_CLOUD_ONLY = process.env.NEXT_PUBLIC_CLOUD_ONLY === "true"

interface SidebarProps {
  view: "list" | "add" | "view"
  setView: (view: "list" | "add" | "view") => void
  noteCount: number
  isCreatingNoteInFolder?: boolean
  onSyncComplete?: (notes: Note[], folders: Folder[]) => void
  onCreateFolder?: () => void
}

export default function Sidebar({ view, setView, noteCount, isCreatingNoteInFolder = false, onSyncComplete, onCreateFolder }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const restoreInputRef = useRef<HTMLInputElement>(null)

  // Prevent hydration mismatch and set up health polling if offline
  useEffect(() => {
    setMounted(true)
    checkApiHealth().then(setIsOnline)
  }, [])

  // Auto-retry connection every 10 seconds if locked out in cloud-only mode
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (IS_CLOUD_ONLY && !isOnline && mounted) {
      interval = setInterval(async () => {
        const online = await checkApiHealth()
        if (online) {
          setIsOnline(true)
          // Fetch notes and folders automatically when coming back online
          const result = await syncNotesToCloud()
          if (result.success) onSyncComplete?.(result.notes, result.folders)
        }
      }, 10000)
    }
    return () => clearInterval(interval)
  }, [isOnline, mounted, onSyncComplete])

  // Close sidebar when view changes on mobile
  const handleViewChange = (newView: "list" | "add" | "view") => {
    setView(newView)
    setIsOpen(false)
  }

  const isLockedOut = IS_CLOUD_ONLY && !isOnline && mounted

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncNotesToCloud()
      // Recheck online status after sync
      const online = await checkApiHealth()
      setIsOnline(online)
      
      if (result.success) {
        onSyncComplete?.(result.notes, result.folders)
      }
      alert(result.message)
    } catch (error) {
      alert("Failed to sync notes")
      console.error(error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const result = await createNotesBackup()
      if (!result.success || !result.data) {
        alert(result.message)
        return
      }

      const blob = new Blob([result.data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const backupDate = new Date().toISOString().split("T")[0]
      link.href = url
      link.download = `notes-backup-${backupDate}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      const online = await checkApiHealth()
      setIsOnline(online)
      alert(result.message)
    } catch (error) {
      alert("Failed to create backup")
      console.error(error)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestoreClick = () => {
    restoreInputRef.current?.click()
  }

  const handleRestoreFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    try {
      const backupJson = await file.text()
      const result = await restoreNotesFromBackup(backupJson)

      const online = await checkApiHealth()
      setIsOnline(online)

      if (result.success) {
        onSyncComplete?.(result.notes, result.folders)
      }

      alert(result.message)
    } catch (error) {
      alert("Failed to restore notes")
      console.error(error)
    } finally {
      setIsRestoring(false)
      event.target.value = ""
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.reload()
    } catch (error) {
      console.error("Failed to log out:", error)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">King Note</h1>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Lock Vault"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-40 
          w-64 border-r border-border bg-card p-4 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          top-0 md:top-auto
          h-screen md:h-full
          pt-16 md:pt-4
        `}
      >
        <div className="hidden md:flex items-center justify-center mb-6 mt-2">
          <h1 className="text-2xl font-bold">King Note</h1>
        </div>

        <nav className="space-y-3 flex-1 mt-2">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            className="w-full justify-start py-5"
            onClick={() => handleViewChange("list")}
          >
            <List className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Notes</span>
            {noteCount > 0 && (
              <span className={`ml-auto text-xs rounded-full px-2 py-0.5 flex-shrink-0 ${
                view === "list" 
                  ? "bg-primary-foreground text-primary" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {noteCount}
              </span>
            )}
          </Button>

          <Button
            variant={view === "add" ? "default" : "ghost"}
            className="w-full justify-start py-5"
            onClick={() => handleViewChange("add")}
            disabled={isLockedOut}
          >
            <PenLine className="mr-2 h-4 w-4" />
            New Note
          </Button>

          {!isCreatingNoteInFolder && onCreateFolder && (
            <Button
              variant="ghost"
              className="w-full justify-start py-5"
              onClick={() => {
                onCreateFolder()
                if (window.innerWidth < 768) setIsOpen(false)
              }}
              disabled={isLockedOut}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          )}

          {!isCreatingNoteInFolder && (
            <Button
              variant="ghost"
              className="w-full justify-start py-5"
              onClick={handleSync}
              disabled={isSyncing || isLockedOut}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync to Cloud"}
            </Button>
          )}

          {!isCreatingNoteInFolder && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start py-5"
                  disabled={isBackingUp || isRestoring || isLockedOut}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isBackingUp
                    ? "Creating backup..."
                    : isRestoring
                      ? "Restoring..."
                      : "Backup / Restore"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem onClick={handleBackup} disabled={isBackingUp || isRestoring}>
                  <Download className="mr-2 h-4 w-4" />
                  Backup as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRestoreClick} disabled={isBackingUp || isRestoring}>
                  <Upload className="mr-2 h-4 w-4" />
                  Restore from JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <input
            ref={restoreInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleRestoreFileChange}
          />
        </nav>

        {/* Cloud status indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {isOnline ? (
            <>
              <Cloud className="h-3 w-3 text-green-500" />
              <span>Backend connected</span>
            </>
          ) : (
            <div className={`flex items-center gap-2 ${IS_CLOUD_ONLY ? "animate-pulse text-red-500 font-medium" : ""}`}>
              <CloudOff className="h-3 w-3 text-red-500" />
              <span>{IS_CLOUD_ONLY ? "Server down (UI Locked)" : "Offline mode"}</span>
            </div>
          )}
        </div>

        {/* Desktop Footer Actions */}
        {mounted && (
          <div className="hidden md:flex flex-col gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Lock Vault
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full justify-start"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
