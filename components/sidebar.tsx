"use client"

import { Button } from "@/components/ui/button"
import { PenLine, List, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface SidebarProps {
  view: "list" | "add" | "view"
  setView: (view: "list" | "add" | "view") => void
  noteCount: number
}

export default function Sidebar({ view, setView, noteCount }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-64 border-r border-border bg-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl font-bold">NoteTaker</h1>
      </div>

      <nav className="space-y-2 flex-1">
        <Button
          variant={view === "list" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setView("list")}
        >
          <List className="mr-2 h-4 w-4" />
          Notes
          {noteCount > 0 && <span className="ml-auto bg-muted text-xs rounded-full px-2 py-0.5">{noteCount}</span>}
        </Button>

        <Button
          variant={view === "add" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setView("add")}
        >
          <PenLine className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </nav>

      {mounted && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="mt-auto"
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
  )
}
