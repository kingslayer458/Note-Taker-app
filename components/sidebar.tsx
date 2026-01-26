"use client"

import { Button } from "@/components/ui/button"
import { PenLine, List, Moon, Sun, Menu, X } from "lucide-react"
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
  const [isOpen, setIsOpen] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close sidebar when view changes on mobile
  const handleViewChange = (newView: "list" | "add" | "view") => {
    setView(newView)
    setIsOpen(false)
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
            <List className="mr-2 h-4 w-4" />
            Notes
            {noteCount > 0 && (
              <span className="ml-auto bg-muted text-xs rounded-full px-2 py-0.5">
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
