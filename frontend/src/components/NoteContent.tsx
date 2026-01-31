"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Home,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  ArrowRight,
  Download,
} from "lucide-react"
import { Button } from "./ui/button"
import { Link, useNavigate } from "react-router-dom"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { notesAPI, usersAPI } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"

interface ApiNote {
  _id: string
  title: string
  slug?: string
  excerpt?: string
  description?: string
  category: string
  chapter: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  content: string
  readingTime?: string
  author?: string
  isPremium?: boolean
}

interface NoteContentProps {
  note: ApiNote
  relatedNotes: any[]
  nextNote?: ApiNote | null
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border-rose-200",
}

const categoryColors: Record<string, string> = {
  JavaScript: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  React: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  MERN: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Interview: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  DSA: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  "System Design": "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

export function NoteContent({ note, relatedNotes, nextNote }: NoteContentProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const navigate = useNavigate()
  const { token } = useAuth()

  // Check if the note is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token || !note._id) return

      try {
        const response = await usersAPI.checkSaved(token, [note._id], [])
        setIsSaved(response.savedNotes?.[note._id] || false)
      } catch (err) {
        console.error("Failed to check saved status:", err)
      }
    }

    checkSavedStatus()
  }, [token, note._id])

  // Convert chapter name to chapter ID (e.g., "JavaScript" -> "javascript")
  const getChapterId = (chapterName: string) => {
    return chapterName.toLowerCase().replace(/\s+/g, "-")
  }

  const chapterId = getChapterId(note.chapter)

  const handleSaveToggle = async () => {
    if (!token || !note._id) {
      navigate("/login")
      return
    }

    try {
      if (isSaved) {
        console.log("Unsaving note:", note._id)
        await usersAPI.unsaveNote(token, note._id)
        setIsSaved(false)
      } else {
        console.log("Saving note:", note._id)
        const result = await usersAPI.saveNote(token, note._id)
        console.log("Save result:", result)
        setIsSaved(true)
      }
    } catch (err) {
      console.error("Failed to toggle save:", err)
      alert(err instanceof Error ? err.message : "Failed to update save status")
    }
  }

  const handleDownloadPDF = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const blob = await notesAPI.downloadAsPDF(note._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to download PDF:", err)
      alert("Failed to download PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <article className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4">
      <div className="max-w-4xl mx-auto w-full overflow-hidden">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide"
        >
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link to="/notes" className="hover:text-foreground transition-colors">
            Notes
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link to={`/notes?category=${note.category}`} className="hover:text-foreground transition-colors">
            {note.category}
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground font-medium truncate">{note.title}</span>
        </motion.nav>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${categoryColors[note.category] || "bg-secondary text-muted-foreground border-border"}`}>
              {note.category}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${difficultyColors[note.difficulty] || "bg-secondary text-muted-foreground border-border"}`}>
              {note.difficulty}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
              {note.chapter}
            </span>
            {note.readingTime && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                {note.readingTime}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 break-words"
                style={{ fontFamily: "var(--font-cal-sans)" }}
              >
                {note.title}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {note.excerpt || note.description || ""}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="rounded-xl bg-transparent"
                aria-label="Download as PDF"
                title="Download this note as PDF"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveToggle}
                className={`shrink-0 rounded-xl ${isSaved ? "bg-primary/10 border-primary/30 text-primary" : "bg-transparent"}`}
                aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Content - Rendered from Markdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose-invert max-w-none mb-8 sm:mb-12 w-full overflow-hidden"
        >
          <MarkdownRenderer content={note.content} />
        </motion.div>

        {/* Related Notes */}
        {relatedNotes.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16">
            <h3 className="text-xl font-semibold text-foreground mb-6">Related Notes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedNotes.map((related) => (
                <Link
                  key={related._id || related.id}
                  to={`/notes/${related._id || related.id}`}
                  className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${categoryColors[related.category] || "bg-secondary text-muted-foreground border-border"}`}>
                      {related.category}
                    </span>
                    {related.difficulty && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${difficultyColors[related.difficulty] || "bg-secondary text-muted-foreground border-border"}`}>
                        {related.difficulty}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {related.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{related.excerpt || related.description || ""}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4"
        >
          <Button asChild variant="outline" className="rounded-xl bg-transparent w-full sm:w-auto">
            <Link to={`/notes/${chapterId}`} className="flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="truncate">Back to {note.chapter}</span>
            </Link>
          </Button>
          {nextNote ? (
            <Button asChild className="rounded-xl w-full sm:w-auto">
              <Link to={`/notes/${chapterId}/${nextNote.slug}`} className="flex items-center justify-center">
                <span className="truncate">Next: {nextNote.title}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="rounded-xl w-full sm:w-auto">
              <Link to="/notes" className="flex items-center justify-center">
                Browse More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    </article>
  )
}
