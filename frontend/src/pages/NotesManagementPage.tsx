import { useCallback, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import AdminLayout from "../components/AdminLayout"
import { useQuery } from "../hooks/useQuery"
import { notesAPI } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import { fetchChaptersConfig, ChapterConfig } from "../lib/chapters"

interface Note {
  _id: string
  id?: string
  title: string
  category: string
  chapter: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  isPremium: boolean
  status: "Draft" | "Published"
  createdAt: string
}

export default function NotesManagementPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Manage Notes | ${websiteName}`
  }, [websiteName])
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"All" | string>("All")
  const [typeFilter, setTypeFilter] = useState<"All" | "Free" | "Premium">("All")
  const [statusFilter, setStatusFilter] = useState<"All" | "Draft" | "Published">("All")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const notesPerPage = 10
  const [chapters, setChapters] = useState<ChapterConfig[]>([])
  const [loadingChapters, setLoadingChapters] = useState(true)

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
  const categories = ["All", ...Array.from(new Set(chapters.filter(ch => !ch.parentId).map(ch => ch.name))).sort()]

  // Fetch all notes from backend
  const fetchNotes = useCallback(() => {
    return notesAPI.getAllAdmin(token || "")
  }, [token])

  const { data: notesResponse, isLoading, error, refetch } = useQuery(fetchNotes, {
    enabled: Boolean(token),
  })

  const allNotes = (notesResponse?.data || notesResponse?.notes || []).map((note: any) => ({
    ...note,
    id: note._id,
    status: note.status || (note.isPublished ? "Published" : "Draft"),
  }))

  // Filter notes
  const filteredNotes = allNotes.filter((note: any) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.chapter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || note.category === categoryFilter
    const matchesType = typeFilter === "All" || (typeFilter === "Free" && !note.isPremium) || (typeFilter === "Premium" && note.isPremium)
    const matchesStatus = statusFilter === "All" || note.status === statusFilter
    return matchesSearch && matchesCategory && matchesType && matchesStatus
  })

  // Pagination
  const indexOfLastNote = currentPage * notesPerPage
  const indexOfFirstNote = indexOfLastNote - notesPerPage
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote)
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage)

  const handleDelete = async (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await notesAPI.delete(token || "", noteId)
        refetch()
      } catch (error) {
        console.error("Failed to delete note:", error)
      }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "Intermediate":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "Advanced":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "JavaScript":
        return "text-yellow-600"
      case "React":
        return "text-sky-500"
      case "MERN":
        return "text-emerald-500"
      case "Interview":
        return "text-pink-500"
      case "DSA":
        return "text-indigo-500"
      case "System Design":
        return "text-orange-500"
      default:
        return "text-muted-foreground"
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
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">Notes Management</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"} found
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/admin/notes/new")}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:inline">Add New Note</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search notes by title or chapter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="h-11 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {(categoryFilter !== "All" || typeFilter !== "All" || statusFilter !== "All") && (
                    <Badge variant="default" className="ml-2 h-5 px-1.5">
                      {(categoryFilter !== "All" ? 1 : 0) +
                        (typeFilter !== "All" ? 1 : 0) +
                        (statusFilter !== "All" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>

                <div className="hidden sm:flex border border-border rounded-lg">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 text-sm ${
                      viewMode === "table" ? "bg-secondary" : ""
                    } rounded-l-lg transition-colors`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`px-4 py-2 text-sm ${
                      viewMode === "card" ? "bg-secondary" : ""
                    } rounded-r-lg transition-colors`}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-card border border-border rounded-xl space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {loadingChapters ? (
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat as any)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              categoryFilter === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {cat}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <div className="flex gap-2">
                      {["All", "Free", "Premium"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setTypeFilter(type as any)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            typeFilter === type
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <div className="flex gap-2">
                      {["All", "Draft", "Published"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status as any)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === status
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Table View */}
          {viewMode === "table" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  <Button onClick={() => refetch()}>Retry</Button>
                </div>
              ) : allNotes.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Notes not available.</p>
                  <Button onClick={() => refetch()}>Retry</Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Chapter
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentNotes.map((note: any, index: number) => (
                      <motion.tr
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-foreground">{note.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getCategoryColor(note.category)}`}>
                            {note.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground">{note.chapter}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getDifficultyColor(note.difficulty)}>
                            {note.difficulty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={note.isPremium ? "default" : "secondary"}>
                            {note.isPremium ? "Premium" : "Free"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={note.status === "Published" ? "default" : "secondary"}
                            className={
                              note.status === "Published"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : ""
                            }
                          >
                            {note.status === "Published" ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/notes/${note.id}`)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/notes/${note.id}/edit`)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {indexOfFirstNote + 1} to{" "}
                    {Math.min(indexOfLastNote, filteredNotes.length)} of {filteredNotes.length}{" "}
                    notes
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="h-9 w-9 p-0"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
                </>
              )}
            </motion.div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  <Button onClick={() => refetch()}>Retry</Button>
                </div>
              ) : allNotes.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">Notes not available.</p>
                  <Button onClick={() => refetch()}>Retry</Button>
                </div>
              ) : (
                currentNotes.map((note: any, index: number) =>
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant={note.isPremium ? "default" : "secondary"}>
                      {note.isPremium ? "Premium" : "Free"}
                    </Badge>
                    <Badge
                      variant={note.status === "Published" ? "default" : "secondary"}
                      className={
                        note.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : ""
                      }
                    >
                      {note.status === "Published" ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{note.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </span>
                      <span className="text-sm text-muted-foreground">• {note.chapter}</span>
                    </div>
                    <Badge className={getDifficultyColor(note.difficulty)}>
                      {note.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={() => navigate(`/notes/${note.id}`)}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => navigate(`/admin/notes/${note._id || note.id}/edit`)}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDelete(note._id || note.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
