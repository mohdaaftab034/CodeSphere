import { useState, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  Download,
  Search,
  Code2,
  Atom,
  Layers,
  Briefcase,
  Trophy,
  Target,
} from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { useQuery } from "../hooks/useQuery"
import { interviewAPI } from "../lib/api"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"

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

// Sample questions with role relevance
const allQuestions = [
  {
    id: 1,
    q: "What is the difference between var, let, and const?",
    difficulty: "beginner",
    topic: "javascript",
    roles: ["software-developer", "web-developer", "frontend-developer", "fullstack-developer"],
    answer:
      "var is function-scoped and can be redeclared, let is block-scoped and cannot be redeclared in the same scope, const is block-scoped and cannot be reassigned after declaration. const is commonly used for values that should not change.",
  },
  {
    id: 2,
    q: "Explain closures in JavaScript",
    difficulty: "intermediate",
    topic: "javascript",
    roles: ["software-developer", "web-developer", "frontend-developer", "fullstack-developer"],
    answer:
      "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. This happens because functions in JavaScript form closures around the data they use.",
  },
  {
    id: 3,
    q: "What is the Event Loop?",
    difficulty: "advanced",
    topic: "javascript",
    roles: ["software-developer", "web-developer", "backend-developer", "fullstack-developer"],
    answer:
      "The Event Loop is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and callback queue, executing callbacks when the stack is empty.",
  },
  {
    id: 4,
    q: "What is the Virtual DOM?",
    difficulty: "beginner",
    topic: "react",
    roles: ["web-developer", "frontend-developer", "fullstack-developer"],
    answer:
      "The Virtual DOM is a lightweight copy of the actual DOM kept in memory. React uses it to compare changes (diffing) and update only the parts of the real DOM that changed, improving performance.",
  },
  {
    id: 5,
    q: "Explain useEffect hook",
    difficulty: "intermediate",
    topic: "react",
    roles: ["web-developer", "frontend-developer", "fullstack-developer"],
    answer:
      "useEffect is used for side effects in functional components. It runs after render and can optionally clean up. The dependency array controls when it re-runs. Common uses include fetching data, subscriptions, and DOM manipulation.",
  },
  {
    id: 6,
    q: "How does React reconciliation work?",
    difficulty: "advanced",
    topic: "react",
    roles: ["frontend-developer", "fullstack-developer"],
    answer:
      "React reconciliation is the process of comparing the new Virtual DOM with the previous one to determine the minimum number of changes needed to update the real DOM. It uses a diffing algorithm with heuristics like same-level comparison and key-based optimization.",
  },
  {
    id: 7,
    q: "Explain RESTful API design principles",
    difficulty: "intermediate",
    topic: "api-design",
    roles: ["backend-developer", "fullstack-developer", "software-developer"],
    answer:
      "RESTful APIs follow principles like: statelessness, resource-based URLs, HTTP methods for CRUD operations (GET, POST, PUT, DELETE), proper status codes, and consistent naming conventions. Resources are represented in JSON or XML.",
  },
  {
    id: 8,
    q: "What is database indexing?",
    difficulty: "intermediate",
    topic: "databases",
    roles: ["backend-developer", "fullstack-developer", "software-developer"],
    answer:
      "Database indexing creates a data structure that improves the speed of data retrieval operations. Indexes are created on columns to quickly locate rows without scanning the entire table, but they add overhead to write operations.",
  },
  {
    id: 9,
    q: "Design a URL shortener service",
    difficulty: "advanced",
    topic: "system-design",
    roles: ["software-developer", "backend-developer", "fullstack-developer"],
    answer:
      "Key components: 1) Hash function for generating short URLs, 2) Database for mapping (consider Redis for caching), 3) Load balancer, 4) Analytics tracking, 5) Expiration mechanism. Consider scalability, collision handling, and redirect performance.",
  },
  {
    id: 10,
    q: "What is the difference between authentication and authorization?",
    difficulty: "beginner",
    topic: "security",
    roles: ["backend-developer", "fullstack-developer", "software-developer"],
    answer:
      "Authentication verifies WHO you are (login credentials), while authorization determines WHAT you can access (permissions). Authentication comes first, then authorization checks if the authenticated user has permission for specific resources or actions.",
  },
  {
    id: 11,
    q: "Explain the concept of hoisting in JavaScript",
    difficulty: "intermediate",
    topic: "javascript",
    roles: ["software-developer", "web-developer", "frontend-developer", "fullstack-developer"],
    answer:
      "Hoisting is JavaScript's behavior of moving declarations to the top of their scope before code execution. Function declarations are fully hoisted, var declarations are hoisted but not initialized (undefined), while let and const are hoisted but not accessible until their declaration (temporal dead zone).",
  },
  {
    id: 12,
    q: "What are React Hooks rules?",
    difficulty: "beginner",
    topic: "react",
    roles: ["web-developer", "frontend-developer", "fullstack-developer"],
    answer:
      "React Hooks have two main rules: 1) Only call Hooks at the top level (not inside loops, conditions, or nested functions), 2) Only call Hooks from React function components or custom Hooks. These rules ensure Hooks are called in the same order on every render.",
  },
  {
    id: 13,
    q: "Explain database normalization",
    difficulty: "intermediate",
    topic: "databases",
    roles: ["backend-developer", "fullstack-developer", "software-developer"],
    answer:
      "Database normalization is the process of organizing data to reduce redundancy and improve data integrity. It involves dividing tables and establishing relationships between them. Common forms include 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies).",
  },
  {
    id: 14,
    q: "What is middleware in Express.js?",
    difficulty: "intermediate",
    topic: "node",
    roles: ["backend-developer", "fullstack-developer", "web-developer"],
    answer:
      "Middleware functions in Express.js have access to the request, response, and next middleware function. They can execute code, modify request/response objects, end the request-response cycle, or call the next middleware. Common uses include authentication, logging, and error handling.",
  },
  {
    id: 15,
    q: "Explain CSS specificity",
    difficulty: "intermediate",
    topic: "css",
    roles: ["frontend-developer", "web-developer"],
    answer:
      "CSS specificity determines which styles are applied when multiple rules target the same element. Calculated as (inline, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Inline styles have highest priority, then IDs (100), classes (10), and elements (1). !important overrides specificity.",
  },
]

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

const topicColors: Record<string, string> = {
  javascript: "text-yellow-600",
  react: "text-sky-500",
  mern: "text-emerald-500",
  "api-design": "text-violet-500",
  databases: "text-blue-600",
  "system-design": "text-pink-500",
  security: "text-rose-600",
  node: "text-green-600",
  css: "text-purple-500",
  dsa: "text-indigo-600",
}

export default function RoleInterviewPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const roleData = roleId ? roles[roleId] : null

  // Fetch questions from backend with memoized callback - use role name, not roleId
  const fetchQuestions = useCallback(() => {
    if (!roleData) return Promise.resolve({ questions: [] })
    return interviewAPI.getByRole(roleData.name)
  }, [roleData])
  const { data: questionsResponse, isLoading, error } = useQuery(fetchQuestions)

  const allQuestions = questionsResponse?.questions || []

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

  const filteredQuestions = allQuestions.filter((q: any) => {
    const matchSearch = search === "" || q.question.toLowerCase().includes(search.toLowerCase())
    const matchDifficulty = selectedDifficulty === null || q.difficulty === selectedDifficulty
    return matchSearch && matchDifficulty
  })

  const handleDownloadPDF = () => {
    if (!roleData) return
    // Trigger download by opening URL in new window
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
    const pdfUrl = `${apiBaseUrl}/interview-questions/pdf/${encodeURIComponent(roleData.name)}`
    window.open(pdfUrl, "_blank")
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

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/interview")}
              className="gap-2 hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Roles
            </Button>
          </motion.div>

          {/* Role Header */}
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleData.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <RoleIcon className="w-10 h-10 text-white" />
            </motion.div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              >
                <Target className="w-3.5 h-3.5" />
                {isLoading ? "Loading..." : allQuestions.length} Questions Available
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-foreground mb-3"
                style={{ fontFamily: "var(--font-cal-sans)" }}
              >
                {roleData.name} Interview Prep
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-4"
              >
                {roleData.longDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                <span className="text-sm font-medium text-muted-foreground">Key Topics:</span>
                {roleData.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button size="lg" className="gap-2 whitespace-nowrap" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 px-4 border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-background"
              />
            </div>

            {/* Difficulty Filters */}
            <div className="flex gap-2">
              <Button
                variant={selectedDifficulty === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(null)}
              >
                All
              </Button>
              {["beginner", "intermediate", "advanced"].map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredQuestions.length}</span> of{" "}
            {allQuestions.length} questions
            {selectedDifficulty && (
              <span>
                {" "}
                · <span className="capitalize">{selectedDifficulty}</span> level
              </span>
            )}
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
            </div>
          ) : (
            <>
              {filteredQuestions.map((q: any, idx: number) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.3 }}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) =>
                        prev.includes(q._id) ? prev.filter((x) => x !== q._id) : [...prev, q._id]
                      )
                    }
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
                          <Badge variant="outline" className="text-muted-foreground">
                            {q.category.replace("-", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expanded.includes(q._id) ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expanded.includes(q._id) && (
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
              ))}

              {filteredQuestions.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No questions found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("")
                      setSelectedDifficulty(null)
                    }}
                    className="bg-transparent"
                  >
                    Clear filters
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-secondary/30 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${roleData.color} flex items-center justify-center shadow-lg`}>
              <RoleIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
              Ready for More?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Explore other developer roles or get the complete interview preparation package with detailed
              solutions and company-specific questions.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/interview")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse All Roles
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent" asChild>
                <Link to="/pricing">View Premium Plans</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
