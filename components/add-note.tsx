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
}

export default function AddNote({ onAddNote }: AddNoteProps) {
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
    <div className="max-w-2xl mx-auto">
      <Card className="border-t-4" style={{ borderTopColor: color }}>
        <CardHeader>
          <CardTitle>Create New Note</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={8}
                disabled={isSaving}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Note Color</Label>
              <div className="flex flex-wrap gap-2">
                {["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#22c55e"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full ${color === c ? "ring-2 ring-ring" : ""}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
