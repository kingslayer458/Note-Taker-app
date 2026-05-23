"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Trash2, Pencil, Copy, Check } from "lucide-react"
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
  const [isCopied, setIsCopied] = useState(false)

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
    const handleCopy = async () => {
    // const text = `${note.title}\n\n${note.content}` // disabled this for testing
    const text = note.content
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-0 sm:px-4">
      <div className="mb-3 sm:mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm sm:text-base">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden xs:inline">Back to notes</span>
          <span className="xs:hidden">Back</span>
        </Button>
      </div>

      <Card className="border-t-4" style={{ borderTopColor: color }}>
        <CardHeader className="relative pb-0 p-4 sm:p-6">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  title={isCopied ? "Copied!" : "Copy to clipboard"}
                  className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${isCopied ? "text-green-600 bg-green-50 hover:bg-green-50 hover:text-green-600" : ""
                    }`}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit note" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 pr-16 sm:pr-20">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-lg font-bold"
                placeholder="Note title"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(note.createdAt)}</p>
            </div>
          ) : (
            <div className="pr-16 sm:pr-20">
              <h1 className="text-xl sm:text-2xl font-bold break-words">{note.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{formatDate(note.createdAt)}</p>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm">
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
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base min-h-[150px] sm:min-h-[200px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Note Color</label>
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
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
              <div className="whitespace-pre-wrap break-words">{note.content}</div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="text-xs text-muted-foreground order-2 sm:order-1">ID: {note.id.substring(0, 8)}...</div>

          {isEditing ? (
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-none">
                Save
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )
}
