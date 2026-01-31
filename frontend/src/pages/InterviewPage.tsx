import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import {
  Search,
  Download,
  FileText,
  ChevronDown,
  Lightbulb,
  Target,
  Zap,
  Briefcase,
  ArrowRight,
} from "lucide-react"
import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useQuery } from "../hooks/useQuery"
import { interviewAPI } from "../lib/api"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Hard: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

const topicColors: Record<string, string> = {
  javascript: "text-yellow-600",
  react: "text-sky-500",
  mern: "text-emerald-500",
  "api-design": "text-violet-500",
  databases: "text-blue-600",
  "system-design": "text-pink-500",
  security: "text-rose-600",
}

export default function InterviewPage() {
  const [expanded, setExpanded] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [topic, setTopic] = useState<string | null>(null)

  // Fetch questions from backend with memoized callback
  const fetchQuestions = useCallback(() => interviewAPI.getAll(), [])
  const { data: questionsResponse, isLoading, error } = useQuery(fetchQuestions)

  const allQuestions = questionsResponse?.data || questionsResponse?.questions || []

  const filtered = useMemo(() => {
    return allQuestions.filter((q: any) => {
      const matchSearch = search === "" || q.question.toLowerCase().includes(search.toLowerCase())
      const matchTopic = topic === null || (q.category && q.category.toLowerCase() === topic.toLowerCase())
      return matchSearch && matchTopic
    })
  }, [allQuestions, search, topic])

  // Get unique topics from questions
  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>()
    allQuestions.forEach((q: any) => {
      if (q.category) {
        topics.add(q.category)
      }
    })
    return Array.from(topics).sort()
  }, [allQuestions])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Target className="w-4 h-4" />
            Role-Based Interview Preparation
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            Ace Your Technical Interviews
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Practice with 500+ carefully curated interview questions. Choose your target role to get
            personalized question recommendations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Button size="lg" className="gap-2">
              <Download className="w-4 h-4" />
              Download All Questions (PDF)
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <FileText className="w-4 h-4" />
              JavaScript PDF
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-card"
              />
            </div>
            <Button variant={topic === null ? "default" : "outline"} size="sm" onClick={() => setTopic(null)}>
              All Topics
            </Button>
            {uniqueTopics.map((t) => (
              <Button
                key={t}
                variant={topic === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTopic(t)}
                className="capitalize"
              >
                {t.replace("-", " ")}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> questions from the database. Choose a role above to see targeted questions.
          </div>
        </div>
      </section>

      {/* Questions List */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-muted-foreground">Loading interview questions...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Failed to load questions</h3>
              <p className="text-muted-foreground mb-4">{error.message || "An error occurred"}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </motion.div>
          ) : allQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Questions not available</h3>
              <p className="text-muted-foreground mb-4">No interview questions have been added yet.</p>
            </motion.div>
          ) : (
            filtered.map((q: any, idx: any) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => {
                    const questionId = q._id || q.id
                    setExpanded((prev) =>
                      prev.includes(questionId) ? prev.filter((x) => x !== questionId) : [...prev, questionId]
                    )
                  }}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-secondary/30 transition-colors duration-200"
                >
                  <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-2 pr-8">{q.question}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={difficultyColors[q.difficulty]}>{q.difficulty}</Badge>
                      {q.category && (
                        <Badge variant="outline" className={topicColors[q.category.toLowerCase()] || "text-gray-600"}>
                          {q.category.replace("-", " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded.includes(q._id || q.id) ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded.includes(q._id || q.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-4 bg-secondary/20">
                        <div className="sm:pl-14">
                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                                Answer
                              </h4>
                              <div className="text-sm leading-relaxed break-words">
                                {q.content ? (
                                  <InterviewQuestionRenderer content={q.content} />
                                ) : (
                                  <p className="text-muted-foreground">{q.answer}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}

          {filtered.length === 0 && allQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No questions found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setTopic(null)
                }}
                className="bg-transparent"
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2
              className="text-2xl lg:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Want more interview questions?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get access to our complete interview prep package with 500+ questions, detailed solutions, and
              company-specific question sets.
            </p>
            <Button size="lg" asChild>
              <Link to="/pricing">
                View Plans <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
