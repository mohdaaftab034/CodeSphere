import { useCallback, useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Briefcase, Tag } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import AdminLayout from "../components/AdminLayout"
import { useQuery } from "../hooks/useQuery"
import { interviewAPI } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"

interface InterviewQuestion {
  id: string
  question: string
  answer: string
  content?: string
  difficulty: "Easy" | "Medium" | "Hard"
  roles: string[]
}

const roles = [
  "Software Developer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
]

export default function InterviewManagementPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Manage Interviews | ${websiteName}`
  }, [websiteName])
  const { token } = useAuth()
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [draftQuestion, setDraftQuestion] = useState<InterviewQuestion | null>(null)

  // Fetch questions from backend (memoized to avoid re-trigger loops)
  const fetchQuestions = useCallback(() => interviewAPI.getAllAdmin(token || ""), [token])
  const { data: questionsResponse, isLoading, error, refetch } = useQuery(fetchQuestions, {
    enabled: Boolean(token),
  })

  // Normalize API shape
  const questions = useMemo(() => {
    const list = questionsResponse?.data || questionsResponse?.questions || []
    return list.map((q: any) => ({
      ...q,
      id: q._id || q.id,
      roles: Array.isArray(q.roles)
        ? q.roles
        : q.role
          ? [q.role]
          : [],
    })) as InterviewQuestion[]
  }, [questionsResponse])

  const filteredQuestions = questions.filter((q) => q.roles.includes(selectedRole))

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return
    try {
      await interviewAPI.delete(token || "", id)
      refetch()
    } catch (err) {
      console.error("Failed to delete interview question", err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "Medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "Hard":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      default:
        return "bg-secondary"
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">Interview Content</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage interview questions by role
                  </p>
                </div>
              </div>
              <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={() => navigate("/admin/interviews/new")}>
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Add / Edit Question - Role Multiselect UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-card border border-border rounded-xl p-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Add / Edit Question</h3>
                  <p className="text-sm text-muted-foreground">Assign one question to multiple roles.</p>
                </div>
                <Button className="flex items-center gap-2" onClick={() => navigate("/admin/interviews/new")}>
                  <Plus className="w-4 h-4" />
                  New Question
                </Button>
              </div>

              {/* Roles Multi-select */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Select Roles</p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        if (!draftQuestion) {
                          setDraftQuestion({
                            id: "temp",
                            question: "",
                            answer: "",
                            difficulty: "Medium",
                            roles: [role],
                          })
                        } else {
                          const exists = draftQuestion.roles.includes(role)
                          const updatedRoles = exists
                            ? draftQuestion.roles.filter((r) => r !== role)
                            : [...draftQuestion.roles, role]
                          setDraftQuestion({ ...draftQuestion, roles: updatedRoles })
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        draftQuestion?.roles.includes(role)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                {draftQuestion?.roles?.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {draftQuestion.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Select at least one role.</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Role Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {role}
              </button>
            ))}
          </motion.div>

          {/* Questions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">Content not available.</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-card border border-border rounded-xl">
                <p className="text-muted-foreground mb-4">Failed to load interview questions.</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center bg-card border border-border rounded-xl">
                <p className="text-muted-foreground mb-2">Content not available.</p>
                <p className="text-muted-foreground">No interview questions have been added yet.</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === question.id ? null : question.id
                      )
                    }
                    className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <h3 className="text-lg font-medium text-foreground">
                            {question.question}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {question.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDraftQuestion(question)
                            setShowRoleSelector(true)
                          }}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title="Edit question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(question.id)
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedQuestion === question.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answer - Accordion */}
                  {expandedQuestion === question.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 border-t border-border"
                    >
                      <div className="pt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Answer:</p>
                        <div className="prose prose-sm max-w-none">
                          {question.content ? (
                            <InterviewQuestionRenderer content={question.content} />
                          ) : (
                            <p className="text-sm text-foreground leading-relaxed">{question.answer}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">No questions found for {selectedRole}</p>
                <Button className="mt-4" onClick={() => navigate("/admin/interviews/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
