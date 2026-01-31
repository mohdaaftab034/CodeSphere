export type ChapterConfig = { 
  id: string
  name: string
  level: string
  description?: string
  icon?: string
  gradient?: string
  hasSubChapters?: boolean
  parentId?: string
}

export async function fetchChaptersConfig(): Promise<ChapterConfig[]> {
  const res = await fetch('/chapters.json')
  if (!res.ok) throw new Error('Failed to load chapters config')
  return res.json()
}

export async function getChapterById(id: string): Promise<ChapterConfig | null> {
  const list = await fetchChaptersConfig()
  return list.find(c => c.id === id) || null
}

export async function getSubChapters(parentId: string): Promise<ChapterConfig[]> {
  const list = await fetchChaptersConfig()
  return list.filter(c => c.parentId === parentId)
}
