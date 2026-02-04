import { useState, useCallback, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  ArrowLeft,
  Search,
  Code2,
  Atom,
  Layers,
  Briefcase,
  Trophy,
  Target,
  Filter,
  CheckCircle2,
  Download,
  Lock,
  Loader2,
} from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { useQuery } from "../hooks/useQuery"
import { interviewAPI } from "../lib/api"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"
import { useAuth } from "../contexts/AuthContext"
import SubscriptionModal from "../components/SubscriptionModal"
import { toast } from "react-hot-toast"

// Role definitions
const roles: Record<string, {
  id: string
  name: string
  description: string
  longDescription: string
  icon: any
  color: string
  topics: string[]
}> = {
  "software-developer": {
    id: "software-developer",
    name: "Software Developer",
    description: "General software development covering data structures, algorithms, and system design",
    longDescription: "Prepare for general software developer roles with questions covering data structures, algorithms, design patterns, and system design fundamentals. Perfect for roles at tech companies, startups, and enterprises.",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    topics: ["javascript", "react", "dsa", "system-design"],
  },
  "web-developer": {
    id: "web-developer",
    name: "Web Developer",
    description: "Focus on frontend and backend web technologies",
    longDescription: "Master web development interviews with questions on HTML, CSS, JavaScript, React, Node.js, and full-stack concepts. Ideal for web developer positions across all company sizes.",
    icon: Atom,
    color: "from-violet-500 to-purple-500",
    topics: ["javascript", "react", "mern", "web-fundamentals"],
  },
  "frontend-developer": {
    id: "frontend-developer",
    name: "Frontend Developer",
    description: "User interface development with modern frameworks and tools",
    longDescription: "Excel in frontend interviews with deep dives into React, JavaScript, CSS, performance optimization, and modern UI/UX patterns. Perfect for UI engineer and frontend specialist roles.",
    icon: Layers,
    color: "from-sky-500 to-blue-500",
    topics: ["javascript", "react", "css", "performance"],
  },
  "backend-developer": {
    id: "backend-developer",
    name: "Backend Developer",
    description: "Server-side development, databases, and API design",
    longDescription: "Ace backend developer interviews with questions on Node.js, databases, API design, authentication, microservices, and system architecture. Designed for server-side engineering roles.",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-500",
    topics: ["node", "databases", "api-design", "system-design"],
  },
  "fullstack-developer": {
    id: "fullstack-developer",
    name: "Full Stack Developer",
    description: "End-to-end development covering frontend, backend, and deployment",
    longDescription: "Prepare for full-stack roles with comprehensive coverage of frontend, backend, databases, DevOps, and system design. Perfect for full-stack engineer positions at any scale.",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    topics: ["javascript", "react", "mern", "system-design", "devops"],
  },
}

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

export default function RoleInterviewPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const { isPaid, user, token } = useAuth()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

  const roleData = roleId ? roles[roleId] : null

  // Fetch questions from backend with memoized callback - use role name, not roleId
  const fetchQuestions = useCallback(() => {
    if (!roleData) return Promise.resolve({ questions: [] })
    return interviewAPI.getByRole(roleData.name)
  }, [roleData])
  const { data: questionsResponse, isLoading, error } = useQuery(fetchQuestions)

  const allQuestions = questionsResponse?.questions || []

  // Filter Logic - match InterviewPage logic
  const filtered = useMemo(() => {
    return allQuestions.filter((q: any) => {
      const matchSearch = search === "" || q.question.toLowerCase().includes(search.toLowerCase())
      const qDiff = q.difficulty?.toLowerCase()
      const matchDifficulty = selectedDifficulties.length === 0 ||
        selectedDifficulties.some(d => d.toLowerCase() === qDiff)
      return matchSearch && matchDifficulty
    })
  }, [allQuestions, search, selectedDifficulties])

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [search, selectedDifficulties])

  // Set page title
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  useEffect(() => {
    if (roleData) {
      document.title = `${roleData.name} Interview Prep | ${websiteName}`
    }
  }, [roleData, websiteName])

  const handleDownloadPDF = async () => {
    if (!isPaid && user?.role !== "admin") {
      setIsSubscriptionModalOpen(true)
      return
    }

    if (!roleData || !token) return

    setIsDownloading(true)
    try {
      const blob = await interviewAPI.downloadAsPDF(roleData.name, token)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${roleData.name.replace(/\s+/g, "_")}_Interview_Questions.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("PDF downloaded successfully!")
    } catch (err: any) {
      console.error("Download failed:", err)
      toast.error(err.message || "Failed to download PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  if (!roleData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Role Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The interview role you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/interview")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Interview Prep
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }



  const RoleIcon = roleData.icon

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Failed to load questions</h2>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <Button onClick={() => navigate("/interview")}>Back to Interview Prep</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Condensed Hero Section */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/interview")}
              className="gap-2 hover:bg-secondary mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Roles
            </Button>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
              {roleData.name} Interview Prep
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {roleData.longDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Key Topics:</span>
                {roleData.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
              <div className="sm:ml-auto">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  variant="default"
                  className="gap-2 shadow-lg shadow-primary/20"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    isPaid || user?.role === "admin" ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />
                  )}
                  {isDownloading ? "Generating PDF..." : "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar - Role Info (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-28 shadow-sm">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleData.color} flex items-center justify-center flex-shrink-0 shadow-lg mb-4`}>
                <RoleIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{roleData.name}</h3>
              <p className="text-sm text-muted-foreground">{roleData.description}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {isLoading ? "Loading..." : allQuestions.length} Questions Available
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Mobile Role Info */}
            <div className="lg:hidden flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${roleData.color} flex items-center justify-center flex-shrink-0`}>
                <RoleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{roleData.name}</h3>
                <p className="text-sm text-muted-foreground">{allQuestions.length} Questions</p>
              </div>
            </div>

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
                    <div className="space-y-4">
                      {/* Search */}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-3 block">Search</label>
                        <Input
                          placeholder="Search questions..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      {/* Difficulty Filter */}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-3 block">Difficulty</label>
                        <div className="space-y-2">
                          <Button
                            variant={selectedDifficulties.length === 0 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDifficulties([])}
                            className="w-full justify-start"
                          >
                            All Levels
                          </Button>
                          {["beginner", "intermediate", "advanced"].map((diff) => (
                            <Button
                              key={diff}
                              variant={selectedDifficulties.includes(diff) ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                setSelectedDifficulties(prev =>
                                  prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
                                )
                              }
                              className="w-full justify-start capitalize"
                            >
                              {diff}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
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

            {/* Difficulty Filters - Desktop Only */}
            <div className="hidden lg:flex gap-2 flex-wrap">
              <Button
                variant={selectedDifficulties.length === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulties([])}
              >
                All
              </Button>
              {["beginner", "intermediate", "advanced"].map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulties.includes(diff) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedDifficulties(prev =>
                      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
                    )
                  }
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-20 bg-card border border-border rounded-xl border-dashed">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading specific questions...</p>
                </div>
              ) : paginatedQuestions.length > 0 ? (
                paginatedQuestions.map((q: any, idx: number) => (
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
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  )
}
