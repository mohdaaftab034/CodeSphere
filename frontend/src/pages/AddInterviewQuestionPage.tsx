import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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

const roleOptions = [
  "Software Developer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
]

const topicOptions = [
  "JavaScript",
  "React",
  "MERN",
  "DSA",
  "System Design",
  "API Design",
]

type Difficulty = "Beginner" | "Intermediate" | "Advanced"

export default function AddInterviewQuestionPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Add Interview Question | ${websiteName}`
  }, [websiteName])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    difficulty: "Intermediate" as Difficulty,
    topics: ["JavaScript", "React"] as string[],
  })

  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    "Software Developer",
    "Frontend Developer",
  ])

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const toggleTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }))
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
    if (selectedRoles.length === 0) {
      alert("Please select at least one role")
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
      const payload = {
        question: formData.title,
        description: formData.description,
        content: formData.content,
        answer: formData.content, // Backend requires answer field
        difficulty: formData.difficulty,
        roles: selectedRoles,
        topics: formData.topics,
      }

      const result = await interviewAPI.create(token, payload)

      if (result.success || result.question) {
        alert(`Question ${status === "draft" ? "saved as draft" : "published"}!`)
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
                <h1 className="text-2xl font-bold text-foreground">Add Interview Question</h1>
                <p className="text-sm text-muted-foreground">Single markdown input for answers with automatic formatting.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handlePreview}>
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleSubmit("draft")}>
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button className="gap-2" onClick={() => handleSubmit("published")}>
                <Send className="w-4 h-4" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Beginner", "Intermediate", "Advanced"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setFormData({ ...formData, difficulty: level as Difficulty })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.difficulty === level
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:text-foreground"
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Topics / Tech Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {topicOptions.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${formData.topics.includes(topic)
                            ? "bg-foreground text-background border-foreground"
                            : "bg-muted text-muted-foreground border-border hover:text-foreground"
                            }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="gap-1">
                          <Tag className="w-3 h-3" />
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
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

                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedRoles.includes(role)
                        ? "bg-primary text-primary-foreground border-primary"
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
                      <Badge key={role} variant="secondary" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-500">Pick at least one role.</p>
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
                    {formData.difficulty}
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

                  {(selectedRoles.length > 0 || formData.topics.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {formData.topics.map((topic) => (
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
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>
                  <Button className="gap-2 w-full" onClick={() => handleSubmit("published")}>
                    <Send className="w-4 h-4" /> Publish
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
