import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, ChevronDown, FileText, Code2, Atom, Layers, Briefcase, Zap } from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { HandwrittenNoteCard } from "../components/HandwrittenNoteCard"
import { Button } from "../components/ui/button"
import { useQuery } from "../hooks/useQuery"
import { pdfsAPI } from "../lib/api"

const categories = [
  { id: "all", label: "All Notes", icon: FileText, color: "text-foreground" },
  { id: "JavaScript", label: "JavaScript", icon: Code2, color: "text-yellow-600" },
  { id: "React", label: "React", icon: Atom, color: "text-sky-500" },
  { id: "MERN", label: "MERN Stack", icon: Layers, color: "text-emerald-500" },
  { id: "Interview", label: "Interview", icon: Briefcase, color: "text-pink-500" },
  { id: "DSA", label: "DSA", icon: Zap, color: "text-violet-600" },
]

const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

export default function HandwrittenNotesListingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [showPremium, setShowPremium] = useState<"all" | "free" | "premium">("all")
  const [savedNotes, setSavedNotes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch PDFs from backend
  const fetchPdfs = useCallback(() => pdfsAPI.getAll(), [])
  const { data: pdfsResponse, isLoading, error } = useQuery(fetchPdfs)

  const allNotes = pdfsResponse?.pdfs || []

  const filteredNotes = useMemo(() => {
    return allNotes.filter((note: any) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.subject && note.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || note.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "all" || note.difficulty === selectedDifficulty
      const matchesPremium =
        showPremium === "all" ||
        (showPremium === "premium" && note.isPremium) ||
        (showPremium === "free" && !note.isPremium)

      return matchesSearch && matchesCategory && matchesDifficulty && matchesPremium
    })
  }, [searchQuery, selectedCategory, selectedDifficulty, showPremium, allNotes])

  const toggleSave = (noteId: string) => {
    setSavedNotes((prev) => (prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]))
  }

  const activeFiltersCount = (selectedCategory !== "all" ? 1 : 0) + (selectedDifficulty !== "all" ? 1 : 0) + (showPremium !== "all" ? 1 : 0)

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Failed to load notes</h2>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
              Handwritten Coding Notes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Premium handwritten PDF notes for interviews, exams, and revision. Clean, organized, and easy to download.
            </p>
          </motion.div>

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
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              className="h-12 px-4 rounded-xl border-border bg-transparent"
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

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Difficulty Level</label>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
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

                  {/* Premium Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Note Type</label>
                    <div className="flex flex-wrap gap-2">
                      {["all", "free", "premium"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setShowPremium(type as "all" | "free" | "premium")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            showPremium === type
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {type === "all" ? "All Types" : type === "premium" ? "Premium Only" : "Free Only"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => {
                          setSelectedCategory("all")
                          setSelectedDifficulty("all")
                          setShowPremium("all")
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

          {/* Category Quick Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const IconComponent = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${selectedCategory === cat.id ? "" : cat.color}`} />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                "Loading notes..."
              ) : (
                <>
                  Showing <span className="font-medium text-foreground">{filteredNotes.length}</span> notes
                  {selectedCategory !== "all" && (
                    <span>
                      {" "}
                      in <span className="font-medium text-foreground capitalize">{selectedCategory}</span>
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Notes Grid */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Notes not available</h3>
              <p className="text-muted-foreground mb-6">No handwritten notes have been published yet.</p>
            </motion.div>
          ) : allNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Notes not available</h3>
              <p className="text-muted-foreground mb-6">No handwritten notes have been published yet.</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
                Retry
              </Button>
            </motion.div>
          ) : filteredNotes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredNotes.map((note: any, index: number) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <HandwrittenNoteCard
                    note={note}
                    isSaved={savedNotes.includes(note._id)}
                    onToggleSave={() => toggleSave(note._id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedDifficulty("all")
                  setShowPremium("all")
                }}
                className="bg-transparent"
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
