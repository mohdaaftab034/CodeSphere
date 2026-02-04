import { useCallback, useMemo, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { NoteContent } from "../components/NoteContent"
import { notesAPI } from "../lib/api"
import { useQuery } from "../hooks/useQuery"

export default function NoteDetailPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { chapterId, topicSlug } = useParams<{ chapterId?: string; topicSlug: string }>()

  // Fetch single note from API
  const fetchNote = useCallback(async () => {
    if (!topicSlug) return null
    return notesAPI.getBySlug(topicSlug)
  }, [topicSlug])

  const { data: noteResponse, isLoading, error } = useQuery(fetchNote, {
    enabled: Boolean(topicSlug),
  })

  const note: any = noteResponse?.note || noteResponse?.data || noteResponse || null

  // Fetch notes in same chapter (if available) for next/previous navigation
  const fetchChapterNotes = useCallback(async () => {
    if (!note?.chapter) return { notes: [] }
    return notesAPI.getPublished({ chapter: note.chapter })
  }, [note?.chapter])

  const { data: chapterNotesResponse } = useQuery(fetchChapterNotes, {
    enabled: Boolean(note?.chapter),
  })

  const chapterNotes = chapterNotesResponse?.notes || []

  // Calculate next note in chapter
  const nextNote = useMemo(() => {
    if (!chapterNotes.length || !note) return null
    const currentIndex = chapterNotes.findIndex((n: any) => n.slug === topicSlug)
    if (currentIndex === -1 || currentIndex === chapterNotes.length - 1) return null
    return chapterNotes[currentIndex + 1]
  }, [chapterNotes, topicSlug, note])

  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} | ${websiteName}`
    } else {
      document.title = `Note | ${websiteName}`
    }
  }, [note?.title, websiteName])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center text-muted-foreground">Loading note...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !note) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Note Not Found</h1>
            <p className="text-muted-foreground">We couldn't find the requested note. Please check the URL or browse notes.</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <NoteContent note={note} nextNote={nextNote} />
      <Footer />
    </main>
  )
}
