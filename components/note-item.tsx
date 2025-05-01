import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Note } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface NoteItemProps {
  note: Note
}

export default function NoteItem({ note }: NoteItemProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{note.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{note.content}</p>
      </CardContent>
    </Card>
  )
}
