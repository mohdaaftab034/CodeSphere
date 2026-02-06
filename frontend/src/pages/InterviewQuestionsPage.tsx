import { useMemo, useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Download,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"
import { interviewAPI } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import SubscriptionModal from "../components/SubscriptionModal"
import { toast } from "react-hot-toast"

const ITEMS_PER_PAGE = 10

const toTitleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

const difficultyLabel = (slug: string) => {
  const normalized = slug.toLowerCase()
  if (normalized === "beginner") return "Easy"
  if (normalized === "intermediate") return "Medium"
  if (normalized === "advanced") return "Hard"
  return toTitleCase(slug)
}

const difficultyBadge = (value: string) => {
  const normalized = value.toLowerCase()
  if (normalized === "easy" || normalized === "beginner") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
  if (normalized === "medium" || normalized === "intermediate") return "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
  return "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20"
}

const normalizeDifficultyBucket = (value: string) => {
  const normalized = value.toLowerCase()
  if (normalized === "easy" || normalized === "beginner") return "easy"
  if (normalized === "medium" || normalized === "intermediate") return "medium"
  if (normalized === "hard" || normalized === "advanced") return "hard"
  return ""
}

interface InterviewQuestionsPageProps {
  pageType: "topic" | "company" | "role" | "difficulty"
  paramKey: "topicSlug" | "companySlug" | "roleSlug" | "difficultySlug"
}

export default function InterviewQuestionsPage({ pageType, paramKey }: InterviewQuestionsPageProps) {
  const params = useParams()
  const slug = (params as Record<string, string | undefined>)[paramKey] || ""
  const navigate = useNavigate()
  const { isPaid, user, token } = useAuth()
  const [expanded, setExpanded] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const pageTitle = useMemo(() => {
    const suffix = pageType === "difficulty" ? difficultyLabel(slug) : toTitleCase(slug)
    return `${suffix} Questions`
  }, [pageType, slug])

  const fetchQuestions = useCallback(() => interviewAPI.getByTypeSlug(pageType, slug), [pageType, slug])
  const [questionsResponse, setQuestionsResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true)
        const response = await fetchQuestions()
        setQuestionsResponse(response)
        setError(null)
      } catch (err: any) {
        setQuestionsResponse({ questions: [] })
        setError(err.message || "No questions available")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadQuestions()
    }
  }, [fetchQuestions, slug])

  useEffect(() => {
    setCurrentPage(1)
    setExpanded([])
    setSelectedDifficulty("all")
  }, [slug, pageType])

  useEffect(() => {
    const websiteName = import.meta.env.VITE_WEBSITE_NAME
    if (slug) {
      document.title = `${pageTitle} | ${websiteName}`
    }
  }, [slug, pageTitle])

  const allQuestions = questionsResponse?.questions || []

  const sortedQuestions = useMemo(() => {
    return [...allQuestions].sort((a: any, b: any) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
  }, [allQuestions])

  const difficultyCounts = useMemo(() => {
    const counts = { easy: 0, medium: 0, hard: 0 }
    sortedQuestions.forEach((q: any) => {
      const bucket = normalizeDifficultyBucket(q?.difficulty || "")
      if (bucket === "easy") counts.easy += 1
      if (bucket === "medium") counts.medium += 1
      if (bucket === "hard") counts.hard += 1
    })
    return counts
  }, [sortedQuestions])

  const filteredQuestions = useMemo(() => {
    if (selectedDifficulty === "all") return sortedQuestions
    const selectedBucket = normalizeDifficultyBucket(selectedDifficulty)
    return sortedQuestions.filter((q: any) =>
      normalizeDifficultyBucket(q?.difficulty || "") === selectedBucket
    )
  }, [selectedDifficulty, sortedQuestions])

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredQuestions, currentPage])

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)

  const toggleExpanded = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleDownloadPDF = async () => {
    if (!isPaid && user?.role !== "admin") {
      setIsSubscriptionModalOpen(true)
      return
    }

    if (!token) return

    setIsDownloading(true)
    try {
      const blob = await interviewAPI.downloadByType(pageType, slug, token)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${slug}-interview-questions.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success("PDF downloaded successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 px-4">
          <div className="max-w-md mx-auto text-center p-8 bg-card border border-border rounded-2xl shadow-sm">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No questions found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any questions for this category. Try exploring other topics.
            </p>
            <Button onClick={() => navigate("/interview")} className="w-full">
              Back to Interview Prep
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border/50 pb-8">
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/interview")}
                className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors -ml-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Hub
              </Button>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3"
                >
                  {pageTitle}
                </motion.h1>
                <p className="text-muted-foreground text-lg">
                  {filteredQuestions.length} {filteredQuestions.length === 1 ? "question" : "questions"} curated for you
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                onClick={handleDownloadPDF}
                disabled={isDownloading || filteredQuestions.length === 0}
              >
                {isPaid || user?.role === "admin" ? (
                  <Download className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {isDownloading ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
            {/* Sidebar Filter */}
            <aside className="space-y-6">
              <div className="sticky top-28 p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 opacity-70">
                  Difficulty Level
                </h3>
                <div className="space-y-2">
                  {["all", "easy", "medium", "hard"].map((value) => {
                    const label = value === "all" ? "All Levels" : value.charAt(0).toUpperCase() + value.slice(1)
                    const count = value === "all"
                      ? sortedQuestions.length
                      : difficultyCounts[value as "easy" | "medium" | "hard"]

                    const isActive = selectedDifficulty === value

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setSelectedDifficulty(value)
                          setCurrentPage(1)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                          }`}
                      >
                        <span>{label}</span>
                        <Badge variant={isActive ? "secondary" : "outline"} className={`ml-auto ${isActive ? "bg-white/20 text-white" : ""}`}>
                          {count}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            {/* Questions List */}
            <div className="min-h-[500px]">
              {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-card/30 border border-border border-dashed rounded-3xl">
                  <BookOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">No questions match this filter.</p>
                  <Button variant="link" onClick={() => setSelectedDifficulty("all")}>Clear filters</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedQuestions.map((question: any, index: number) => {
                    const isOpen = expanded.includes(question._id)
                    return (
                      <motion.div
                        key={question._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`group relative bg-card border transition-all duration-300 rounded-2xl overflow-hidden ${isOpen ? "ring-2 ring-primary/20 shadow-xl" : "border-border hover:border-primary/30 hover:shadow-lg"
                          }`}
                      >
                        <div
                          onClick={() => toggleExpanded(question._id)}
                          className="p-6 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs font-mono text-muted-foreground/70 bg-secondary/50">
                                  Q{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                </Badge>
                                <Badge className={difficultyBadge(question.difficulty || "Medium")}>
                                  {question.difficulty || "Medium"}
                                </Badge>
                              </div>

                              <h3 className="text-lg md:text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                {question.question}
                              </h3>

                              {question.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {question.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(question.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5" />
                                  {question.views || 0} views
                                </span>
                              </div>
                            </div>

                            <div className={`p-2 rounded-full bg-secondary/50 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180 bg-primary/10 text-primary" : "group-hover:bg-primary/10 group-hover:text-primary"}`}>
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="border-t border-border/50 bg-secondary/5 px-6 pb-6 pt-2">
                                <div className="prose prose-sm dark:prose-invert max-w-none pt-4">
                                  <InterviewQuestionRenderer content={question.content || question.answer || "No answer provided."} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="text-sm font-medium text-muted-foreground px-4">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  )
}



