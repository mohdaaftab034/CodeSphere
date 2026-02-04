import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { InterviewFilters } from "../components/InterviewFilters"
import {
  Search,
  ChevronDown,
  Filter,
  CheckCircle2,
  Briefcase
} from "lucide-react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "../hooks/useQuery"
import { interviewAPI } from "../lib/api"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Beginner": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Intermediate": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Hard: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  "Advanced": "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

const ITEMS_PER_PAGE = 10

export default function InterviewPage() {
  // Filters State
  const [expanded, setExpanded] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch questions from backend
  const fetchQuestions = useCallback(() => interviewAPI.getAll(), [])
  const { data: questionsResponse, isLoading, error } = useQuery(fetchQuestions)

  const allQuestions = questionsResponse?.data || questionsResponse?.questions || []

  // Extract unique topics
  const availableTopics = useMemo(() => {
    const topics = new Set<string>()
    allQuestions.forEach((q: any) => {
      if (q.category) topics.add(q.category)
    })
    return Array.from(topics).sort()
  }, [allQuestions])

  // Filter Logic
  const filtered = useMemo(() => {
    return allQuestions.filter((q: any) => {
      const matchSearch = search === "" || q.question.toLowerCase().includes(search.toLowerCase())

      const qDiff = q.difficulty?.toLowerCase()
      // Normalize selected difficulties to lowercase for comparison
      const matchDifficulty = selectedDifficulties.length === 0 ||
        selectedDifficulties.some(d => d.toLowerCase() === qDiff)

      const matchTopic = selectedTopics.length === 0 ||
        (q.category && selectedTopics.includes(q.category))

      return matchSearch && matchDifficulty && matchTopic
    })
  }, [allQuestions, search, selectedDifficulties, selectedTopics])

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [search, selectedDifficulties, selectedTopics])

  // Set page title
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  useEffect(() => {
    document.title = `Interview Questions | ${websiteName}`
  }, [websiteName])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Condensed Hero Section */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
              Interview Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Browse {allQuestions.length}+ curated questions to ace your next technical interview.
            </p>
          </div>
          <div className="hidden md:flex gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground self-center pl-2">
              Join 2,000+ developers practicing
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-28 shadow-sm">
              <InterviewFilters
                search={search}
                setSearch={setSearch}
                selectedDifficulties={selectedDifficulties}
                setSelectedDifficulties={setSelectedDifficulties}
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
                availableTopics={availableTopics}
                totalQuestions={allQuestions.length}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Mobile Filter Toggle & Search Bar Row */}
            <div className="flex gap-4 items-center lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <div className="py-6">
                    <h2 className="text-lg font-bold mb-6">Filter Questions</h2>
                    <InterviewFilters
                      search={search}
                      setSearch={setSearch}
                      selectedDifficulties={selectedDifficulties}
                      setSelectedDifficulties={setSelectedDifficulties}
                      selectedTopics={selectedTopics}
                      setSelectedTopics={setSelectedTopics}
                      availableTopics={availableTopics}
                      totalQuestions={allQuestions.length}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card"
                />
              </div>
            </div>

            {/* Desktop Search Bar (Header of List) */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search filtered questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card border-border/80 focus:border-primary transition-all"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Showing <b>{filtered.length}</b> results
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-20 bg-card border border-border rounded-xl border-dashed">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading specific questions...</p>
                </div>
              ) : paginatedQuestions.length > 0 ? (
                paginatedQuestions.map((q: any, idx) => (
                  <motion.div
                    key={q.id || q._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-card border border-border hover:border-primary/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => {
                        const qId = q._id || q.id
                        setExpanded(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId])
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:flex flex-col items-center gap-1 mt-1">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            Q{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className={`capitalize font-medium border-0 ${difficultyColors[q.difficulty] || "bg-secondary text-foreground"}`}>
                              {q.difficulty}
                            </Badge>
                            {q.category && (
                              <Badge variant="secondary" className="capitalize text-xs font-normal text-muted-foreground">
                                {q.category}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors pr-4">
                            {q.question}
                          </h3>
                        </div>

                        <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground">
                          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expanded.includes(q._id || q.id) ? "rotate-180" : ""}`} />
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded.includes(q._id || q.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-border/50 bg-secondary/10"
                        >
                          <div className="px-2 py-4 sm:p-6 sm:pl-16">
                            <div className="flex gap-4">
                              <div className="mt-1">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 prose prose-sm dark:prose-invert max-w-none text-muted-foreground w-full break-words">
                                {q.content ? (
                                  <InterviewQuestionRenderer content={q.content} />
                                ) : (
                                  <p>{q.answer}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                ))) : (
                <div className="text-center py-20 bg-card border border-border rounded-xl border-dashed">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No matching questions</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We couldn't find any questions matching your active filters. Try clearing some filters or searching for something else.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearch("")
                    setSelectedDifficulties([])
                    setSelectedTopics([])
                  }}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
