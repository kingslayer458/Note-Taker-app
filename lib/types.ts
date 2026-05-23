export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  color?: string
  folder_id?: string | null
}

export interface Folder {
  id: string
  name: string
  color?: string
  createdAt: string
}
