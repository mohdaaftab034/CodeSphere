import { useState, useCallback, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import AdminLayout from "../components/AdminLayout"
import { Switch } from "../components/ui/switch"
import { useAuth } from "../contexts/AuthContext"
import { notesAPI } from "../lib/api"
import { fetchChaptersConfig, ChapterConfig } from "../lib/chapters"
import { MarkdownEditor } from "../components/MarkdownEditor"

export default function NoteEditorPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { token, user } = useAuth()

  useEffect(() => {
    if (isEdit) {
      document.title = `Edit Note | ${websiteName}`
    } else {
      document.title = `Create Note | ${websiteName}`
    }
  }, [isEdit, websiteName])

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    chapter: "", // chapter title for backend compatibility
    chapterId: "", // JSON-driven chapter id
    content: "", // Markdown content
    difficulty: "Beginner",
    excerpt: "",
    author: user?.name || "Admin",
    readingTime: "5 min",
    isPremium: false,
    status: "Draft" as "Draft" | "Published",
  })

  const [chapters, setChapters] = useState<ChapterConfig[]>([])
  const [loadingChapters, setLoadingChapters] = useState(true)
  const [loadingNote, setLoadingNote] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  // Fetch chapters on mount
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const list = await fetchChaptersConfig()
        setChapters(list)
      } catch (error) {
        console.error("Failed to load chapters:", error)
      } finally {
        setLoadingChapters(false)
      }
    }
    loadChapters()
  }, [])

  // Get unique categories from chapters
  const categories = Array.from(new Set(chapters.filter(ch => !ch.parentId).map(ch => ch.name))).sort()

  // Get filtered chapters based on selected category
  const filteredChapters = chapters.filter(ch => {
    if (!formData.category) return true
    // If category matches a top-level chapter, show its sub-chapters
    const parentChapter = chapters.find(c => c.name === formData.category && !c.parentId)
    if (parentChapter) {
      return ch.parentId === parentChapter.id || ch.id === parentChapter.id
    }
    return true
  })

  // Fetch existing note if editing
  useEffect(() => {
    if (!isEdit || !id) {
      setLoadingNote(false)
      return
    }

    const loadNote = async () => {
      try {
        const response = await notesAPI.getById(id)
        const note = response.note || response.data || response

        // Populate form data
        setFormData({
          title: note.title || "",
          slug: note.slug || "",
          category: note.category || "JavaScript",
          chapter: note.chapter || "",
          chapterId: note.chapterId || "",
          content: note.content || "",
          difficulty: note.difficulty || "Beginner",
          excerpt: note.excerpt || "",
          author: note.author || user?.name || "Admin",
          readingTime: note.readingTime || "5 min",
          isPremium: note.isPremium || false,
          status: note.status || "Draft",
        })
      } catch (error) {
        console.error("Failed to load note:", error)
        alert("Failed to load note. Please try again.")
        navigate("/admin/notes")
      } finally {
        setLoadingNote(false)
      }
    }

    loadNote()
  }, [id, isEdit, navigate, user?.name])

  const handleSubmit = useCallback(
    async (status: "Draft" | "Published") => {
      if (!token) {
        navigate("/login")
        return
      }

      // Basic required checks
      if (!formData.title || !formData.category || !formData.chapter) {
        alert("Title, category, and chapter are required.")
        return
      }

      if (!formData.content || formData.content.trim().length === 0) {
        alert("Content is required. Paste or type your markdown content.")
        return
      }

      setSaving(true)

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        category: formData.category,
        chapter: formData.chapter.trim(),
        chapterId: formData.chapterId || undefined,
        content: formData.content.trim(),
        difficulty: formData.difficulty,
        excerpt: formData.excerpt.trim() || undefined,
        author: formData.author.trim() || "Admin",
        readingTime: formData.readingTime.trim() || "5 min",
        isPremium: formData.isPremium,
        status,
      }

      try {
        if (isEdit && id) {
          // Update existing note
          await notesAPI.update(token, id, payload)
          alert("Note updated successfully!")
        } else {
          // Create new note
          await notesAPI.create(token, payload)
          alert("Note created successfully!")
        }
        navigate("/admin/notes")
      } catch (error: any) {
        console.error("Failed to save note:", error)
        const errorMsg = error?.message || "Failed to save note"
        alert(`Error saving note: ${errorMsg}. Please check all required fields.`)
      } finally {
        setSaving(false)
      }
    },
    [formData, navigate, token, isEdit, id]
  )

  const handlePreview = () => {
    alert("Preview would open here showing the note as users would see it")
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  onClick={() => navigate("/admin/notes")}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                  {isEdit ? "Edit Note" : "Create New Note"}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2 flex-1 sm:flex-initial" disabled={loadingNote || saving}>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button
                  onClick={() => handleSubmit("Draft")}
                  variant="outline"
                  className="flex items-center gap-2 flex-1 sm:flex-initial"
                  disabled={loadingNote || saving}
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? "Saving..." : "Save Draft"}</span>
                  <span className="sm:hidden">Draft</span>
                </Button>
                <Button
                  onClick={() => handleSubmit("Published")}
                  className="flex items-center gap-2 flex-1 sm:flex-initial"
                  disabled={loadingNote || saving}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? "Publishing..." : "Publish"}</span>
                  <span className="sm:hidden">Publish</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingNote && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-block">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-muted-foreground">Loading note...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loadingNote && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-card border border-border rounded-xl space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="title">Note Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Understanding React Hooks"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      {loadingChapters ? (
                        <div className="h-11 px-3 rounded-lg border border-border bg-background flex items-center text-sm text-muted-foreground">
                          Loading categories...
                        </div>
                      ) : (
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value, chapterId: "", chapter: "" })}
                          className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground"
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chapter">Chapter *</Label>
                      {loadingChapters ? (
                        <div className="h-11 px-3 rounded-lg border border-border bg-background flex items-center text-sm text-muted-foreground">
                          Loading chapters...
                        </div>
                      ) : filteredChapters.length > 0 ? (
                        <select
                          id="chapter"
                          value={formData.chapterId}
                          onChange={(e) => {
                            const selectedId = e.target.value
                            const selected = chapters.find((c) => c.id === selectedId)
                            setFormData({
                              ...formData,
                              chapterId: selectedId,
                              chapter: selected?.name || "",
                            })
                          }}
                          className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground"
                        >
                          <option value="">Select a chapter</option>
                          {filteredChapters.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.parentId ? `  ↳ ${ch.name}` : ch.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="h-11 px-3 rounded-lg border border-border bg-background flex items-center text-sm text-muted-foreground">
                          {formData.category ? "No chapters for this category" : "Select a category first"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (optional)</Label>
                      <Input
                        id="slug"
                        type="text"
                        placeholder="auto-generated if left empty"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Published" })}
                        className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="readingTime">Reading Time</Label>
                      <Input
                        id="readingTime"
                        type="text"
                        placeholder="e.g., 5 min"
                        value={formData.readingTime}
                        onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        type="text"
                        placeholder="e.g., Admin"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Premium</Label>
                      <div className="flex items-center gap-3 h-11">
                        <Switch
                          checked={formData.isPremium}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                        />
                        <span className="text-sm text-muted-foreground">Mark as premium</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Short summary (max 500 characters)"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                </motion.div>

                {/* Markdown Content Editor */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-card border border-border rounded-xl space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Content (Markdown)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Paste your content as markdown. Support headings, paragraphs, code blocks, and more. Code blocks are automatically syntax-highlighted.
                    </p>
                  </div>

                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder={`# Example Markdown\n\nWrite your explanation here.\n\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\`\n\nMore text after the code block.`}
                  />
                </motion.div>
              </div>

              {/* Sidebar - Settings */}
              <div className="space-y-6">
                {/* Publishing Options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-card border border-border rounded-xl space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Publishing</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Access Type</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Control who can view this
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, isPremium: false })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            !formData.isPremium
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, isPremium: true })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            formData.isPremium
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          Premium
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Label className="text-sm font-medium">Status</Label>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Current: <Badge>{formData.status}</Badge>
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSubmit("Draft")}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={saving}
                        >
                          Save Draft
                        </Button>
                        <Button
                          onClick={() => handleSubmit("Published")}
                          size="sm"
                          className="flex-1"
                          disabled={saving}
                        >
                          Publish
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Preview Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-card border border-border rounded-xl space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Note Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Category</p>
                      <Badge variant="secondary">{formData.category}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Difficulty</p>
                      <Badge
                        className={
                          formData.difficulty === "Beginner"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : formData.difficulty === "Intermediate"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500"
                        }
                      >
                        {formData.difficulty}
                      </Badge>
                    </div>
                    {formData.chapter && (
                      <div>
                        <p className="text-muted-foreground mb-1">Chapter</p>
                        <p className="text-foreground font-medium">{formData.chapter}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
