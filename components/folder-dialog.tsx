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

const ICON_CATEGORIES = [
  { name: "All", keywords: [] },
  { name: "Cloud & DevOps", keywords: ["cloud", "aws", "gcp", "azure", "docker", "kubernetes", "linux", "ubuntu", "server", "terminal", "powershell", "cloudflare"] },
  { name: "Programming", keywords: ["code", "dev", "java", "python", "golang", "js", "ts", "javascript", "react", "node", "sql", "db", "mongo", "django", "studio"] },
  { name: "Design", keywords: ["adobe", "figma", "sketch", "draw", "photo", "creative", "design"] },
  { name: "Gaming", keywords: ["game", "steam", "xbox", "playstation", "nintendo", "minecraft", "epic", "godot"] },
]

const PREMIUM_SKILL_ICONS = [
  "aws", "gcp", "azure", "cloudflare", "docker", "kubernetes", "linux", "ubuntu", "debian", "redhat", "apple", "windows", "nginx", "jenkins", "git", "github", "gitlab", "bitbucket",
  "python", "javascript", "typescript", "java", "cpp", "c", "cs", "go", "rust", "ruby", "php", "swift", "kotlin", "dart", "lua",
  "react", "nextjs", "vue", "nuxtjs", "angular", "svelte", "tailwind", "sass", "css", "html", "bootstrap", "materialui",
  "nodejs", "express", "django", "flask", "spring", "laravel", "dotnet", "nestjs",
  "mysql", "postgres", "mongodb", "redis", "sqlite", "cassandra", "prisma", "supabase", "firebase",
  "figma", "ps", "ai", "pr", "ae", "xd", "discord", "vscode", "vim", "neovim", "idea", "androidstudio", "unity", "unreal", "godot", "blender"
].map(skill => ({
  name: `Premium Glass ${skill} Logo`,
  url_icon: `https://skillicons.dev/icons?i=${skill}`
}));

export default function FolderDialog({ isOpen, initialData, onClose, onSubmit }: FolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
  const [selectedIconUrl, setSelectedIconUrl] = useState<string | undefined>(undefined)
  const [icons, setIcons] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
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
        Promise.all([
          fetch("https://raw.githubusercontent.com/icon11-community/Folder-Ico/main/Folder11.json").then(res => res.json()).catch(() => ({ icons: [] })),
          fetch("https://raw.githubusercontent.com/devicons/devicon/master/devicon.json").then(res => res.json()).catch(() => [])
        ])
          .then(([folderData, deviconData]) => {
            let combinedIcons: any[] = [...PREMIUM_SKILL_ICONS]
            if (folderData && folderData.icons) {
              combinedIcons = [...combinedIcons, ...folderData.icons]
            }
            if (deviconData && Array.isArray(deviconData)) {
              const devIcons = deviconData.map((d: any) => ({
                name: d.name,
                url_icon: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${d.name}/${d.name}-${d.versions.svg[0]}.svg`
              }))
              combinedIcons = [...combinedIcons, ...devIcons]
            }
            setIcons(combinedIcons)
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

  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === "All") return matchesSearch;
    
    const category = ICON_CATEGORIES.find(c => c.name === activeCategory);
    if (!category) return matchesSearch;
    
    const matchesCategory = category.keywords.some(kw => icon.name.toLowerCase().includes(kw));
    return matchesSearch && matchesCategory;
  }).slice(0, 100) // limit to 100 to prevent severe UI lag

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
                <div className="space-y-2 bg-muted/40 p-3 rounded-lg border border-border/50">
                  <Label htmlFor="custom-url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paste Custom Image URL</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="custom-url"
                      placeholder="https://example.com/icon.png or .gif" 
                      value={selectedIconUrl || ""}
                      onChange={e => setSelectedIconUrl(e.target.value)}
                      className="h-8 text-xs"
                    />
                    {selectedIconUrl && (
                      <div className="w-8 h-8 shrink-0 bg-background border rounded flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={selectedIconUrl} 
                          alt="Preview" 
                          className="w-6 h-6 object-contain" 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'; 
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-medium">Or choose from library</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Input 
                    placeholder="Search library..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-[200px] h-8 text-xs"
                  />
                  {selectedIconUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIconUrl("")} className="h-8 text-xs">
                      Clear Icon
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {ICON_CATEGORIES.map(cat => (
                    <Button 
                      key={cat.name} 
                      type="button" 
                      variant={activeCategory === cat.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(cat.name)}
                      className="whitespace-nowrap rounded-full text-xs h-7 px-3"
                    >
                      {cat.name}
                    </Button>
                  ))}
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
