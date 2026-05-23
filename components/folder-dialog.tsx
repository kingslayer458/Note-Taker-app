"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FolderDialogProps {
  isOpen: boolean
  initialData?: { name: string; color: string; icon_url?: string }
  onClose: () => void
  onSubmit: (name: string, color: string, icon_url?: string) => void
}

const PRESET_COLORS = [
  { name: "Win 11", value: "#eab308" },
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
  const [selectedIconUrl, setSelectedIconUrl] = useState<string | undefined>(undefined)
  const [icons, setIcons] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingIcons, setIsLoadingIcons] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFolderName(initialData.name)
        setSelectedColor(initialData.color || PRESET_COLORS[0].value)
        setSelectedIconUrl(initialData.icon_url || "")
      } else {
        setFolderName("")
        setSelectedColor(PRESET_COLORS[0].value)
        setSelectedIconUrl("")
      }

      // Fetch icons if we haven't already
      if (icons.length === 0) {
        setIsLoadingIcons(true)
        fetch("https://raw.githubusercontent.com/icon11-community/Folder-Ico/main/Folder11.json")
          .then(res => res.json())
          .then(data => {
            if (data && data.icons) setIcons(data.icons)
          })
          .catch(err => console.error("Failed to load icons:", err))
          .finally(() => setIsLoadingIcons(false))
      }
    }
  }, [isOpen, initialData, icons.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onSubmit(folderName.trim(), selectedColor, selectedIconUrl)
    }
  }

  const filteredIcons = icons.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 100) // limit to 100 to prevent severe UI lag

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Folder" : "Create New Folder"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Change the name, color, and icon of your folder." : "Enter a name, color, and optional custom icon."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="icon">Custom Icon</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6 pt-4">
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
            </TabsContent>

            <TabsContent value="icon" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Input 
                    placeholder="Search icons..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-[200px]"
                  />
                  {selectedIconUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIconUrl("")}>
                      Clear Icon
                    </Button>
                  )}
                </div>
                
                {isLoadingIcons ? (
                  <div className="flex justify-center items-center h-48">
                    <p className="text-muted-foreground animate-pulse">Loading amazing icons...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <div className="grid grid-cols-4 gap-4">
                      {filteredIcons.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setSelectedIconUrl(icon.url_icon)}
                          className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                            selectedIconUrl === icon.url_icon 
                              ? "bg-primary/20 ring-2 ring-primary" 
                              : "hover:bg-muted"
                          }`}
                          title={icon.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={icon.url_icon} 
                            alt={icon.name} 
                            className="w-10 h-10 object-contain drop-shadow-sm"
                            loading="lazy"
                          />
                          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                            {icon.name.replace(/_/g, " ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
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
