"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PenLine, List, Moon, Sun, Menu, X, Database, Download, Upload } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { createNotesBackup, restoreNotesFromBackup } from "@/lib/storage"
import type { Note } from "@/lib/types"

interface SidebarProps {
  view: "list" | "add" | "view"
  setView: (view: "list" | "add" | "view") => void
  noteCount: number
  onRestoreComplete?: (notes: Note[]) => void
}

export default function Sidebar({ view, setView, noteCount, onRestoreComplete }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const restoreInputRef = useRef<HTMLInputElement>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close sidebar when view changes on mobile
  const handleViewChange = (newView: "list" | "add" | "view") => {
    setView(newView)
    setIsOpen(false)
  }

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const result = createNotesBackup()
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
      const result = restoreNotesFromBackup(backupJson)

      if (result.success) {
        onRestoreComplete?.(result.notes)
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

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">NoteTaker</h1>
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
        <div className="hidden md:flex items-center justify-center mb-8 mt-4">
          <h1 className="text-2xl font-bold">NoteTaker</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            className="w-full justify-start"
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
            className="w-full justify-start"
            onClick={() => handleViewChange("add")}
          >
            <PenLine className="mr-2 h-4 w-4" />
            New Note
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start"
                disabled={isBackingUp || isRestoring}
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

          <input
            ref={restoreInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleRestoreFileChange}
          />
        </nav>

        {/* Dark mode toggle - only visible on desktop sidebar */}
        {mounted && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mt-auto hidden md:flex"
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
        )}
      </div>
    </>
  )
}
