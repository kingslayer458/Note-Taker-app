"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import type { Note } from "@/lib/types"

interface AddNoteProps {
  onAddNote: (note: Note) => void
  folderId?: string | null
  folderName?: string | null
}

export default function AddNote({ onAddNote, folderId = null, folderName = null }: AddNoteProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [color, setColor] = useState("#6366f1")
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the title input when component mounts
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Create a new note with current timestamp as ID
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim() || "No content",
        createdAt: new Date().toISOString(),
        color,
        folder_id: folderId,
      }

      // Add a small delay to show the saving animation
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Update parent state
      onAddNote(newNote)

      // Reset form
      setTitle("")
      setContent("")
      setColor("#6366f1")
    } catch (err) {
      setError("Failed to save note. Please try again.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-0 sm:px-4">
      <Card className="border-t-4" style={{ borderTopColor: color }}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Create New Note</CardTitle>
          {folderName && (
            <p className="text-sm text-muted-foreground mt-1">Saving into {folderName}</p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Title</Label>
              <Input
                id="title"
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                disabled={isSaving}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm">Content</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
                disabled={isSaving}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] sm:min-h-[200px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Note Color</Label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#22c55e"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-ring ring-offset-2" : ""}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
