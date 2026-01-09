"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Trash2, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import type { Note } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface NoteViewProps {
  note: Note
  onBack: () => void
  onDelete: () => void
  onUpdate?: (note: Note) => void
}

export default function NoteView({ note, onBack, onDelete, onUpdate }: NoteViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [color, setColor] = useState(note.color || "#6366f1")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset form when note prop changes
    setTitle(note.title)
    setContent(note.content)
    setColor(note.color || "#6366f1")
    setIsEditing(false)
    setError(null)
  }, [note])

  const handleSave = () => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!onUpdate) return

    setError(null)

    try {
      const updatedNote: Note = {
        ...note,
        title: title.trim(),
        content: content.trim() || "No content",
        color,
      }

      onUpdate(updatedNote)
      setIsEditing(false)
    } catch (err) {
      setError("Failed to update note. Please try again.")
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Button>
      </div>

      <Card className="border-t-4" style={{ borderTopColor: color }}>
        <CardHeader className="relative pb-0">
          <div className="absolute top-4 right-4 flex gap-2">
            {!isEditing && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit note">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-bold"
                placeholder="Note title"
              />
              <p className="text-sm text-muted-foreground">{formatDate(note.createdAt)}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{note.title}</h1>
              <p className="text-sm text-muted-foreground">{formatDate(note.createdAt)}</p>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded mb-4">
              <span>{error}</span>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Note Color</label>
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
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{note.content}</div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">ID: {note.id.substring(0, 8)}...</div>

          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )
}
