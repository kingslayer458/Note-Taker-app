"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Note } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface NoteCardProps {
  note: Note
  onClick: () => void
  onDelete: () => void
}

export default function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  // Truncate content for preview
  const truncatedContent = note.content.length > 150 ? note.content.substring(0, 150) + "..." : note.content

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <Card
      className="h-full cursor-pointer overflow-hidden border-t-4 hover:shadow-md transition-all duration-200 active:scale-[0.98] flex flex-col"
      style={{ borderTopColor: note.color || "#6366f1" }}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5 flex-1">
        <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-1">{note.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{formatDate(note.createdAt)}</p>
        <p className="text-xs sm:text-sm line-clamp-3 sm:line-clamp-4 whitespace-pre-wrap">{truncatedContent}</p>
      </CardContent>

      <CardFooter className="p-2 sm:p-3 pt-0 flex justify-end mt-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}