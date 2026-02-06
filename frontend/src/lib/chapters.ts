import { chaptersAPI } from "./api"

export type ChapterConfig = {
  id: string
  name: string
  level: string
  description?: string
  icon?: string
  gradient?: string
  hasSubChapters?: boolean
  parentId?: string
  _id?: string // MongoDB ID
  topicCount?: number
  navPath?: string
}

export async function fetchChaptersConfig(): Promise<ChapterConfig[]> {
  try {
    const response = await chaptersAPI.getAll()
    if (response.success && Array.isArray(response.chapters)) {
      return response.chapters
    }
    return []
  } catch (error) {
    console.error("Failed to fetch chapters from API, falling back to static", error)
    // Fallback to static JSON if API fails (e.g. server down)
    const res = await fetch('/chapters.json')
    if (!res.ok) return []
    return res.json()
  }
}

export async function getChapterById(id: string): Promise<ChapterConfig | null> {
  const list = await fetchChaptersConfig()
  const normalizedId = decodeURIComponent(id || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .split("/")
    .pop() || ""

  if (!normalizedId) return null

  const matchById = list.find((c) => c.id === normalizedId)
  if (matchById) return matchById

  const targetPath = `/notes/${normalizedId}`.toLowerCase()
  const matchByNav = list.find((c) =>
    (c.navPath || "").trim().toLowerCase().replace(/\/+$/, "") === targetPath
  )
  return matchByNav || null
}

export async function getSubChapters(parentId: string): Promise<ChapterConfig[]> {
  const list = await fetchChaptersConfig()
  return list.filter(c => c.parentId === parentId)
}
