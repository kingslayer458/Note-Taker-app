"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FolderDialogProps {
  isOpen: boolean
  initialData?: { name: string; color: string }
  onClose: () => void
  onSubmit: (name: string, color: string) => void
}

const PRESET_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
  { name: "Amber", value: "#d97706" },
  { name: "Slate", value: "#475569" },
]

export default function FolderDialog({ isOpen, initialData, onClose, onSubmit }: FolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFolderName(initialData.name)
        setSelectedColor(initialData.color || PRESET_COLORS[0].value)
      } else {
        setFolderName("")
        setSelectedColor(PRESET_COLORS[0].value)
      }
    }
  }, [isOpen, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onSubmit(folderName.trim(), selectedColor)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Folder" : "Create New Folder"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Change the name and color of your folder." : "Enter a name and choose a color for your new folder."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              placeholder="e.g., Ideas, Work, Recipes..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label>Folder Color</Label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color.value 
                      ? "border-primary scale-110 shadow-sm" 
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              {initialData ? "Save Changes" : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
