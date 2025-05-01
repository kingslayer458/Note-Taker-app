"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { Note } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface NoteViewProps {
  note: Note
  onBack: () => void
  onDelete: () => void
}

export default function NoteView({ note, onBack, onDelete }: NoteViewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Button>
      </div>

      <Card className="border-t-4" style={{ borderTopColor: note.color || "#6366f1" }}>
        <CardHeader className="relative pb-0">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-2xl font-bold">{note.title}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(note.createdAt)}</p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{note.content}</div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">ID: {note.id.substring(0, 8)}...</div>
        </CardFooter>
      </Card>
    </div>
  )
}
