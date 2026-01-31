import { motion } from "framer-motion"
import { Download, Bookmark, BookmarkCheck, Lock, FileText, TrendingUp } from "lucide-react"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"

interface HandwrittenNoteCardProps {
  note: any
  isSaved: boolean
  onToggleSave: () => void
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border-rose-200",
  beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  advanced: "bg-rose-100 text-rose-700 border-rose-200",
}

const categoryGradients: Record<string, string> = {
  JavaScript: "from-yellow-500 to-amber-500",
  React: "from-sky-500 to-cyan-500",
  MERN: "from-emerald-500 to-teal-500",
  Interview: "from-pink-500 to-rose-500",
  DSA: "from-violet-500 to-purple-500",
  javascript: "from-yellow-500 to-amber-500",
  react: "from-sky-500 to-cyan-500",
  mern: "from-emerald-500 to-teal-500",
  interview: "from-pink-500 to-rose-500",
  dsa: "from-violet-500 to-purple-500",
}

export function HandwrittenNoteCard({ note, isSaved, onToggleSave }: HandwrittenNoteCardProps) {
  const gradient = categoryGradients[note.category] || "from-gray-500 to-gray-600"
  const subject = note.subject || note.category || "Coding Notes"
  const totalPages = note.totalPages || note.pages || 0
  const downloadCount = note.downloadCount || note.views || 0
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div className="group relative h-full rounded-2xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col">{" "}
        {/* Premium Lock Badge */}
        {note.isPremium && (
          <div className="absolute top-3 right-3 z-20 p-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
            <Lock className="w-4 h-4" />
          </div>
        )}

        {/* Thumbnail / Preview Area */}
        <div className={`relative h-48 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-white/20 mix-blend-multiply" />
          
          {/* Handwritten note mockup */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
            <FileText className="w-16 h-16 mb-4 opacity-80" />
            <p className="text-sm font-medium line-clamp-2">{subject}</p>
          </div>

          {/* Top gradient accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-5">
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-cal-sans)" }}>
            {note.title}
          </h3>

          {/* Subject */}
          <p className="text-xs text-muted-foreground mb-4 line-clamp-1">{subject}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(note.tags || []).slice(0, 2).map((tag: string) => (
              <span key={tag} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats and Difficulty */}
          <div className="flex items-center justify-between mb-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {totalPages} pages
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {downloadCount}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full border font-medium ${difficultyColors[note.difficulty] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {note.difficulty}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              asChild
              size="sm"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              <Link to={`/handwritten-notes/${note._id || note.id}`}>
                <FileText className="w-4 h-4 mr-1.5" />
                Preview
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onToggleSave()
              }}
              className={`rounded-lg ${isSaved ? "bg-primary/10 border-primary/30 text-primary" : "bg-transparent"}`}
              aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg bg-transparent hover:bg-secondary"
              aria-label="Download PDF"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
