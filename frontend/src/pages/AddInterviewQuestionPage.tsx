import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Tag,
  Sparkles,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import AdminLayout from "../components/AdminLayout"
import { InterviewQuestionEditor } from "../components/InterviewQuestionEditor"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"
import { interviewAPI } from "../lib/api"

export default function AddInterviewQuestionPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)

  useEffect(() => {
    document.title = `${isEditMode ? "Edit" : "Add"} Interview Question | ${websiteName}`
  }, [isEditMode, websiteName])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  })

  const [availableMeta, setAvailableMeta] = useState({
    roles: [] as string[],
    topics: [] as string[],
    companies: [] as string[],
    difficulties: [] as string[],
  })

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")

  const [rolesInput, setRolesInput] = useState("")
  const [companiesInput, setCompaniesInput] = useState("")
  const [topicsInput, setTopicsInput] = useState("")
  const [difficultyInput, setDifficultyInput] = useState("")

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await interviewAPI.getMeta()
        setAvailableMeta(response.meta || { roles: [], topics: [], companies: [], difficulties: [] })
      } catch (error) {
        console.error("Failed to load interview meta", error)
      }
    }

    loadMeta()
  }, [])

  useEffect(() => {
    const loadQuestion = async () => {
      if (!id) return
      try {
        setIsLoadingQuestion(true)
        const response = await interviewAPI.getById(id)
        const question = response.question || response
        if (!question) return

        setFormData({
          title: question.question || "",
          description: question.description || "",
          content: question.content || question.answer || "",
        })

        const roles = Array.isArray(question.roles) ? question.roles : []
        const topics = Array.isArray(question.topics) ? question.topics : []
        const companies = Array.isArray(question.companies) ? question.companies : []

        setSelectedRoles(roles)
        setSelectedTopics(topics)
        setSelectedCompanies(companies)
        setSelectedDifficulty(question.difficulty || "")

        setAvailableMeta((prev) => ({
          roles: mergeUnique(prev.roles, roles).sort((a, b) => a.localeCompare(b)),
          topics: mergeUnique(prev.topics, topics).sort((a, b) => a.localeCompare(b)),
          companies: mergeUnique(prev.companies, companies).sort((a, b) => a.localeCompare(b)),
          difficulties: question.difficulty
            ? mergeUnique(prev.difficulties, [question.difficulty]).sort((a, b) => a.localeCompare(b))
            : prev.difficulties,
        }))
      } catch (error) {
        console.error("Failed to load interview question", error)
      } finally {
        setIsLoadingQuestion(false)
      }
    }

    loadQuestion()
  }, [id])

  const parseCommaList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

  const mergeUnique = (base: string[], additions: string[]) => {
    const next = [...base]
    additions.forEach((item) => {
      if (!next.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
        next.push(item)
      }
    })
    return next
  }

  const toggleItem = (value: string, list: string[], setter: (next: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value))
    } else {
      setter([...list, value])
    }
  }

  const addRole = () => {
    const items = parseCommaList(rolesInput)
    if (items.length === 0) return

    setSelectedRoles((prev) => mergeUnique(prev, items))
    setAvailableMeta((prev) => {
      const roles = mergeUnique(prev.roles, items).sort((a, b) => a.localeCompare(b))
      return { ...prev, roles }
    })
    setRolesInput("")
  }

  const addCompany = () => {
    const items = parseCommaList(companiesInput)
    if (items.length === 0) return

    setSelectedCompanies((prev) => mergeUnique(prev, items))
    setAvailableMeta((prev) => {
      const companies = mergeUnique(prev.companies, items).sort((a, b) => a.localeCompare(b))
      return { ...prev, companies }
    })
    setCompaniesInput("")
  }

  const addTopic = () => {
    const items = parseCommaList(topicsInput)
    if (items.length === 0) return

    setSelectedTopics((prev) => mergeUnique(prev, items))
    setAvailableMeta((prev) => {
      const topics = mergeUnique(prev.topics, items).sort((a, b) => a.localeCompare(b))
      return { ...prev, topics }
    })
    setTopicsInput("")
  }

  const addDifficulty = () => {
    const trimmed = difficultyInput.trim()
    if (!trimmed) return
    setSelectedDifficulty(trimmed)
    setAvailableMeta((prev) => ({
      ...prev,
      difficulties: prev.difficulties.some((item) => item.toLowerCase() === trimmed.toLowerCase())
        ? prev.difficulties
        : [...prev.difficulties, trimmed].sort((a, b) => a.localeCompare(b)),
    }))
    setDifficultyInput("")
  }

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title.trim()) {
      alert("Please enter a question title")
      return
    }
    if (!formData.content.trim()) {
      alert("Please enter the answer content")
      return
    }
    const pendingRoles = parseCommaList(rolesInput)
    const mergedRoles = mergeUnique(selectedRoles, pendingRoles)
    if (mergedRoles.length === 0) {
      alert("Please select at least one role")
      return
    }
    const pendingTopics = parseCommaList(topicsInput)
    const pendingCompanies = parseCommaList(companiesInput)
    const mergedTopics = mergeUnique(selectedTopics, pendingTopics)
    const mergedCompanies = mergeUnique(selectedCompanies, pendingCompanies)

    if (mergedTopics.length === 0) {
      alert("Please select at least one topic")
      return
    }
    if (!selectedDifficulty.trim()) {
      alert("Please select a difficulty")
      return
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        alert("You must be logged in as an admin to create questions")
        return
      }

      // Use API utility with token
      if (pendingRoles.length > 0) {
        setSelectedRoles(mergedRoles)
        setRolesInput("")
      }
      if (pendingTopics.length > 0) {
        setSelectedTopics(mergedTopics)
        setTopicsInput("")
      }
      if (pendingCompanies.length > 0) {
        setSelectedCompanies(mergedCompanies)
        setCompaniesInput("")
      }

      const payload = {
        question: formData.title,
        description: formData.description,
        content: formData.content,
        answer: formData.content, // Backend requires answer field
        difficulty: selectedDifficulty,
        roles: mergedRoles,
        topics: mergedTopics,
        companies: mergedCompanies,
      }

      const result = isEditMode && id
        ? await interviewAPI.update(token, id, payload)
        : await interviewAPI.create(token, payload)

      if (result.success || result.question) {
        alert(isEditMode ? "Question updated successfully!" : `Question ${status === "draft" ? "saved as draft" : "published"}!`)
        navigate("/admin/interviews")
      } else {
        alert("Failed to save question")
      }
    } catch (error) {
      console.error("Error saving question:", error)
      alert(`Error saving question: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handlePreview = () => {
    // Preview opens a modal or separate view showing rendered content
    alert("Preview would show the user-facing interview question with rendered markdown.")
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/admin/interviews")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Interviews
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditMode ? "Edit Interview Question" : "Add Interview Question"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditMode ? "Update the existing question details." : "Single markdown input for answers with automatic formatting."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handlePreview}>
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleSubmit("draft")}
                disabled={isLoadingQuestion}
              >
                <Save className="w-4 h-4" />
                {isEditMode ? "Save Changes" : "Save Draft"}
              </Button>
              <Button className="gap-2" onClick={() => handleSubmit("published")} disabled={isLoadingQuestion}>
                <Send className="w-4 h-4" />
                {isEditMode ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoadingQuestion && (
            <div className="mb-6 rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground">
              Loading question details...
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Question Basics */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-card border border-border rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Question Basics</h3>
                    <p className="text-sm text-muted-foreground">Title, description, difficulty, and topics.</p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="w-4 h-4" /> Fresh Entry
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Question Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Explain the Virtual DOM in React"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Question Description</Label>
                  <textarea
                    id="description"
                    placeholder="Optional: Set context, what the interviewer expects, any constraints."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-border bg-background text-foreground resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Difficulty *</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableMeta.difficulties.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedDifficulty(selectedDifficulty === level ? "" : level)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedDifficulty === level
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={difficultyInput}
                      onChange={(e) => setDifficultyInput(e.target.value)}
                      placeholder="Add custom difficulty"
                      className="h-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addDifficulty()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addDifficulty}>
                      Set
                    </Button>
                  </div>
                  {selectedDifficulty && (
                    <p className="text-xs text-muted-foreground">Selected: {selectedDifficulty}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Topics *</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableMeta.topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleItem(topic, selectedTopics, setSelectedTopics)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedTopics.includes(topic)
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                          }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      placeholder="Type topics (comma-separated) and press enter"
                      className="h-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTopic()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                      Add
                    </Button>
                  </div>
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSelectedTopics(selectedTopics.filter((item) => item !== topic))}
                          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                        >
                          <Tag className="w-3 h-3" />
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Roles */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-6 bg-card border border-border rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Applicable Roles *</h3>
                    <p className="text-sm text-muted-foreground">One question can map to multiple roles.</p>
                  </div>
                  <Badge variant="outline">Multi-role</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roles">Roles</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="roles"
                      placeholder="Type roles (comma-separated) and press enter"
                      value={rolesInput}
                      onChange={(e) => setRolesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addRole()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addRole}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableMeta.roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleItem(role, selectedRoles, setSelectedRoles)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedRoles.includes(role)
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {selectedRoles.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRoles(selectedRoles.filter((item) => item !== role))}
                        className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        <Tag className="w-3 h-3" />
                        {role}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-500">Pick at least one role.</p>
                )}
              </motion.div>

              {/* Companies */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 }}
                className="p-6 bg-card border border-border rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Companies</h3>
                    <p className="text-sm text-muted-foreground">Comma-separated list of companies.</p>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companies">Companies</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="companies"
                      placeholder="Type companies (comma-separated) and press enter"
                      value={companiesInput}
                      onChange={(e) => setCompaniesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCompany()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addCompany}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableMeta.companies.map((company) => (
                    <button
                      key={company}
                      type="button"
                      onClick={() => toggleItem(company, selectedCompanies, setSelectedCompanies)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedCompanies.includes(company)
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>

                {selectedCompanies.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedCompanies.map((company) => (
                      <button
                        key={company}
                        type="button"
                        onClick={() => setSelectedCompanies(selectedCompanies.filter((item) => item !== company))}
                        className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        <Tag className="w-3 h-3" />
                        {company}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No companies selected.</p>
                )}
              </motion.div>

              {/* Answer - Markdown Editor */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-card border border-border rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Answer / Explanation *</h3>
                  <span className="text-xs text-muted-foreground">Markdown + Code Blocks</span>
                </div>
                <InterviewQuestionEditor
                  initialContent={formData.content}
                  onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                />
              </motion.div>
            </div>

            {/* Preview + Actions */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-card border border-border rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
                  <Badge variant="outline" className="capitalize">
                    {selectedDifficulty || "Unassigned"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-base font-semibold text-foreground line-clamp-2">
                      {formData.title || "Untitled question"}
                    </h4>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-1">
                        {formData.description}
                      </p>
                    )}
                  </div>

                  {(selectedRoles.length > 0 || selectedTopics.length > 0 || selectedCompanies.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {selectedCompanies.map((company) => (
                        <Badge key={company} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                      {selectedTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {formData.content && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-semibold text-foreground mb-2">Answer Preview</p>
                      <div className="bg-muted/30 rounded-lg p-3 text-sm line-clamp-6 overflow-hidden">
                        <InterviewQuestionRenderer content={formData.content} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-6 bg-card border border-border rounded-xl space-y-3"
              >
                <h3 className="text-lg font-semibold text-foreground">Actions</h3>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="gap-2 w-full" onClick={handlePreview}>
                    <Eye className="w-4 h-4" /> Preview
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 w-full"
                    onClick={() => handleSubmit("draft")}
                    disabled={isLoadingQuestion}
                  >
                    <Save className="w-4 h-4" /> {isEditMode ? "Save Changes" : "Save Draft"}
                  </Button>
                  <Button className="gap-2 w-full" onClick={() => handleSubmit("published")} disabled={isLoadingQuestion}>
                    <Send className="w-4 h-4" /> {isEditMode ? "Update" : "Publish"}
                  </Button>
                  <Button variant="ghost" className="gap-2 w-full" onClick={() => navigate("/admin/interviews")}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
