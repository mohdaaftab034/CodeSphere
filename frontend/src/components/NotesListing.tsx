"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Bookmark, BookmarkCheck, Code2, Atom, Layers, Briefcase, ChevronDown, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "../hooks/useQuery"
import { notesAPI, usersAPI } from "../lib/api"
import { getChapterById } from "../lib/chapters"
import { useAuth } from "../contexts/AuthContext"

const ITEMS_PER_PAGE = 15

const categories = [
  { id: "all", label: "All Notes", icon: null },
  { id: "JavaScript", label: "JavaScript", icon: Code2, color: "text-yellow-600" },
  { id: "React", label: "React.js", icon: Atom, color: "text-sky-500" },
  { id: "MERN", label: "MERN Stack", icon: Layers, color: "text-emerald-500" },
  { id: "DSA", label: "DSA", icon: Layers, color: "text-violet-500" },
  { id: "System Design", label: "System Design", icon: Briefcase, color: "text-pink-500" },
]

const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

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

export function NotesListing({ initialCategory, initialChapterId }: { initialCategory?: string; initialChapterId?: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [savedNotes, setSavedNotes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [activeChapterTitle, setActiveChapterTitle] = useState<string | null>(null)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(initialChapterId || null)
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()
  const { token } = useAuth()

  // Resolve chapter by id (from JSON config)
  const fetchChapter = useCallback(async () => {
    if (!initialChapterId) return null
    const chapter = await getChapterById(initialChapterId)
    return chapter
  }, [initialChapterId])

  const { data: chapterConfig, isLoading: isChapterLoading, error: chapterError } = useQuery(fetchChapter, {
    enabled: !!initialChapterId,
  })

  useEffect(() => {
    if (chapterConfig) {
      setActiveChapterTitle((chapterConfig as any).name)
      setActiveChapterId((chapterConfig as any).id)
    }
  }, [chapterConfig])

  // Fetch notes from backend
  const fetchNotes = useCallback(() => {
    return notesAPI.getPublished({
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      chapter: activeChapterTitle || undefined, // backend compatibility
      chapterId: activeChapterId || undefined, // forward-compatible
      difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
    })
  }, [selectedCategory, selectedDifficulty, activeChapterTitle, activeChapterId])

  const { data: notesResponse, isLoading, error } = useQuery(fetchNotes)

  const allNotes = notesResponse?.notes || []

  // Check saved status for all notes when token or notes change
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token || allNotes.length === 0) return

      try {
        const noteIds = allNotes.map((note: any) => note._id)
        const response = await usersAPI.checkSaved(token, noteIds, [])
        const saved = Object.keys(response.savedNotes || {}).filter(
          (noteId) => response.savedNotes[noteId]
        )
        setSavedNotes(saved)
      } catch (err) {
        console.error("Failed to check saved status:", err)
      }
    }

    checkSavedStatus()
  }, [token, allNotes.length])

  // Initialize category from props
  useEffect(() => {
    const allowed = ["JavaScript", "React", "MERN", "DSA", "System Design"]
    if (initialCategory && allowed.includes(initialCategory)) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  // If we're in chapter mode, default category to all
  useEffect(() => {
    if (initialChapterId) {
      setSelectedCategory("all")
    }
  }, [initialChapterId])

  const filteredNotes = useMemo(() => {
    const base = allNotes.filter((note: any) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.excerpt && note.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    })
    // Sort by createdAt asc (oldest first)
    return base.sort((a: any, b: any) => {
      const ad = new Date(a.createdAt || a.updatedAt || 0).getTime()
      const bd = new Date(b.createdAt || b.updatedAt || 0).getTime()
      return ad - bd
    })
  }, [allNotes, searchQuery])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedDifficulty, activeChapterId])

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex)

  const toggleSave = async (noteId: string) => {
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const isSaved = savedNotes.includes(noteId)
      if (isSaved) {
        console.log("Unsaving note:", noteId)
        await usersAPI.unsaveNote(token, noteId)
        setSavedNotes((prev) => prev.filter((id) => id !== noteId))
      } else {
        console.log("Saving note:", noteId)
        const result = await usersAPI.saveNote(token, noteId)
        console.log("Save result:", result)
        setSavedNotes((prev) => [...prev, noteId])
      }
    } catch (err) {
      console.error("Failed to toggle save:", err)
      alert(err instanceof Error ? err.message : "Failed to update save status")
    }
  }

  const groupedNotes = useMemo(() => {
    const groups: Record<string, typeof allNotes> = {}
    paginatedNotes.forEach((note: any) => {
      const chapter = note.chapter || "Uncategorized"
      if (!groups[chapter]) {
        groups[chapter] = []
      }
      groups[chapter].push(note)
    })
    // Ensure each group is sorted by createdAt asc (oldest first)
    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort((a: any, b: any) => {
        const ad = new Date(a.createdAt || a.updatedAt || 0).getTime()
        const bd = new Date(b.createdAt || b.updatedAt || 0).getTime()
        return ad - bd
      })
    })
    return groups
  }, [paginatedNotes])

  const activeFiltersCount = (selectedCategory !== "all" ? 1 : 0) + (selectedDifficulty !== "all" ? 1 : 0)

  if (chapterError) {
    return (
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Chapter not found</h2>
          <p className="text-muted-foreground mb-6">Unable to load the selected chapter.</p>
          <Button asChild>
            <Link to="/notes">Back to Chapters</Link>
          </Button>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Failed to load notes</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back link */}
        <div className="mb-8">
          {activeChapterTitle && (
            <Link to="/notes" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-4">
              ← Back to Chapters
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
            {activeChapterTitle ? `${activeChapterTitle} Topics` : (selectedCategory && selectedCategory !== "all" ? `${selectedCategory} Notes` : "All Notes")}
          </h1>
          <p className="text-muted-foreground">
            {filteredNotes.length === 0 
              ? (activeChapterTitle ? "No topics found in this chapter yet." : "No notes found in this category yet.")
              : (activeChapterTitle 
                  ? `Browse ${filteredNotes.length} topics in ${activeChapterTitle}.`
                  : `Browse ${filteredNotes.length} comprehensive notes${selectedCategory && selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}.`)}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 px-4 rounded-xl border-border bg-transparent"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {!activeChapterTitle && categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedCategory === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {cat.icon && <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? "" : cat.color}`} />}
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            selectedDifficulty === diff
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {diff === "all" ? "All Levels" : diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        setSelectedCategory("all")
                        setSelectedDifficulty("all")
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Quick Filters (hide in chapter mode) */}
        {!activeChapterTitle && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {cat.icon && <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? "" : cat.color}`} />}
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Loading notes..."
            ) : (
              <>
                Showing <span className="font-medium text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredNotes.length)}</span> of <span className="font-medium text-foreground">{filteredNotes.length}</span> notes
                {selectedCategory !== "all" && (
                  <span>
                    {" "}
                    in <span className="font-medium text-foreground">{selectedCategory}</span>
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Notes Grid by Chapter */}
            {isLoading || isChapterLoading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
            ) : allNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{activeChapterTitle ? "Topics not available" : "Notes not available"}</h3>
                <p className="text-muted-foreground mb-4">{activeChapterTitle ? "No topics have been added to this chapter yet." : "No notes have been uploaded yet. Please check back later."}</p>
          </div>
        ) : Object.keys(groupedNotes).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedNotes).map(([chapter, notes]) => (
              <div key={chapter}>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  {chapter}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note: any, index: number) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <NoteCard 
                        note={note} 
                        isSaved={savedNotes.includes(note._id)} 
                        onToggleSave={() => toggleSave(note._id)}
                        chapterId={activeChapterId || undefined}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedDifficulty("all")
              }}
              className="bg-transparent"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                const showPage = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                
                // Show ellipsis
                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

                if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
                  return null
                }

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-3 py-2 text-muted-foreground">
                      ...
                    </span>
                  )
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "" : "bg-transparent"}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

const categoryIcons: Record<string, typeof Code2> = {
  JavaScript: Code2,
  React: Atom,
  MERN: Layers,
  Interview: Briefcase,
  DSA: Layers,
  "System Design": Briefcase,
}

const categoryGradients: Record<string, string> = {
  JavaScript: "from-yellow-500/80 to-amber-500/80",
  React: "from-sky-500/80 to-cyan-500/80",
  MERN: "from-emerald-500/80 to-teal-500/80",
  Interview: "from-pink-500/80 to-rose-500/80",
  DSA: "from-violet-500/80 to-fuchsia-500/80",
  "System Design": "from-orange-500/80 to-amber-500/80",
}

interface NoteCardProps {
  note: any
  isSaved: boolean
  onToggleSave: () => void
  chapterId?: string
}

function NoteCard({ note, isSaved, onToggleSave, chapterId }: NoteCardProps) {
  const CategoryIcon = categoryIcons[note.category] || Code2

  // Try to get the gradient from chapters.json (by matching chapterId or chapter name)
  const [chapterGradient, setChapterGradient] = useState<string | null>(null);
  useEffect(() => {
    let ignore = false;
    async function fetchGradient() {
      // Try to get by chapterId first
      if (note.chapterId) {
        const chapters = await import("../lib/chapters");
        const chapter = await chapters.getChapterById(note.chapterId);
        if (!ignore && chapter && chapter.gradient) {
          setChapterGradient(chapter.gradient);
          return;
        }
      }
      // Fallback: try to match by chapter name
      const chapters = await import("../lib/chapters");
      const list = await chapters.fetchChaptersConfig();
      const match = list.find((c: any) => c.name === note.chapter);
      if (!ignore && match && match.gradient) {
        setChapterGradient(match.gradient);
      }
    }
    fetchGradient();
    return () => { ignore = true; };
  }, [note.chapterId, note.chapter]);

  // Use chapterGradient if found, else fallback to categoryGradients
  const gradient = chapterGradient || categoryGradients[note.category] || "from-gray-500/80 to-gray-600/80";

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative h-full"
    >
      <div className="relative h-full rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-xl hover:shadow-primary/[0.08] hover:border-primary/40 transition-all duration-300 overflow-hidden">
        {/* Top Gradient Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
        {/* Top-Right Corner Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
          <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 rotate-45 transition-all duration-500 group-hover:scale-150`} />
          <svg className="absolute top-0 right-0 w-16 h-16" viewBox="0 0 64 64">
            <path 
              d="M64 0 L64 64 L0 64" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/0 group-hover:text-primary/30 transition-colors duration-300"
            />
          </svg>
        </div>
        {/* Save Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleSave()
          }}
          className={`absolute top-4 right-4 z-10 p-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 ${
            isSaved 
              ? "bg-primary/15 text-primary shadow-sm" 
              : "bg-card/80 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
          }`}
          aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        <Link to={`/notes/${chapterId || 'chapter'}/${note.slug}`} className="block h-full p-5 pt-6 no-underline text-inherit">
          {/* Category Icon & Chapter */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}>
              <CategoryIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {note.chapter}
            </span>
          </div>
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
            {note.title}
          </h3>
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {note.excerpt || note.description || "No description available"}
          </p>
          {/* Footer with Badges */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[note.category] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
              {note.category}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColors[note.difficulty] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                note.difficulty === "Beginner" ? "bg-emerald-500" :
                note.difficulty === "Intermediate" ? "bg-amber-500" : "bg-rose-500"
              }`} />
              {note.difficulty}
            </span>
          </div>
        </Link>
      </div>
    </motion.div>
  )
}
