import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2, ArrowLeft, Loader2, Save, LayoutGrid, Layers, Edit, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../contexts/AuthContext"
import { chaptersAPI } from "../lib/api"
import { toast } from "react-hot-toast"
import { fetchChaptersConfig, ChapterConfig } from "../lib/chapters"

const ICON_OPTIONS = [
    "Code2", "Layers", "Database", "Server", "Globe", "Briefcase", "Cpu", "Layout", "Terminal", "BookOpen"
]

export default function ManageTopicsPage() {
    const navigate = useNavigate()
    const { token } = useAuth()
    const [chapters, setChapters] = useState<ChapterConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "Code2",
        hasSubChapters: false,
        slug: "",
        navPath: ""
    })

    useEffect(() => {
        loadChapters()
    }, [])

    const loadChapters = async () => {
        try {
            setIsLoading(true)
            const data = await fetchChaptersConfig()
            setChapters(data)
        } catch (error) {
            toast.error("Failed to load topics")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (chapter: ChapterConfig) => {
        setEditingId(chapter._id!)
        setFormData({
            title: chapter.name,
            description: chapter.description || "",
            icon: chapter.icon || "Code2",
            hasSubChapters: chapter.hasSubChapters || false,
            slug: chapter.id,
            navPath: chapter.navPath || ""
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({
            title: "",
            description: "",
            icon: "Code2",
            hasSubChapters: false,
            slug: "",
            navPath: ""
        })
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return

        try {
            await chaptersAPI.delete(token!, id)
            toast.success("Topic deleted successfully")
            loadChapters()
        } catch (error) {
            toast.error("Failed to delete topic")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title) return

        try {
            setIsSubmitting(true)
            if (editingId) {
                await chaptersAPI.update(token!, editingId, formData)
                toast.success("Topic updated successfully!")
            } else {
                await chaptersAPI.create(token!, formData)
                toast.success("Topic created successfully!")
            }
            handleCancelEdit()
            loadChapters()
        } catch (error: any) {
            toast.error(error.message || "Failed to save topic")
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <AdminLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/dashboard")}
                            className="gap-2 pl-0 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">Topic Management</h1>
                        <p className="text-muted-foreground mt-1">Add or edit topics for notes categorization.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Create/Edit Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        {editingId ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                                        {editingId ? "Edit Topic" : "Add New Topic"}
                                    </h2>
                                    {editingId && (
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Topic Name</label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Docker"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Description</label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Short description..."
                                        />
                                    </div>

                                    {/* Removed Level and Parent Selects as requested */}

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Navigation Path</label>
                                        <Input
                                            value={formData.navPath}
                                            onChange={(e) => setFormData({ ...formData, navPath: e.target.value })}
                                            placeholder="e.g. /notes/my-topic"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">If left empty, defaults to /notes/slug</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Icon</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {ICON_OPTIONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon })}
                                                    className={`p-2 rounded-lg border flex items-center justify-center transition-all ${formData.icon === icon
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border hover:bg-secondary"
                                                        }`}
                                                >
                                                    <span className="text-xs">{icon.slice(0, 2)}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Selected: {formData.icon}</p>
                                    </div>

                                    {/* <div className="flex items-center gap-2">
                                         <input
                                            type="checkbox"
                                            id="hasSubChapters"
                                            checked={formData.hasSubChapters}
                                            onChange={(e) => setFormData({...formData, hasSubChapters: e.target.checked})}
                                            className="rounded border-gray-300"
                                         />
                                         <label htmlFor="hasSubChapters" className="text-sm cursor-pointer">Has Sub-chapters?</label>
                                      </div> */}

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingId ? "Updating..." : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" /> {editingId ? "Update Topic" : "Create Topic"}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5 text-primary" /> Existing Topics
                                </h2>

                                {isLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Render All Chapters Flat since hierarchy inputs are removed for simplicity in this step */}
                                        {chapters.map(chapter => (
                                            <div key={chapter.id} className={`border border-border/60 rounded-lg p-4 bg-secondary/20 ${editingId === chapter._id ? "ring-2 ring-primary bg-primary/5" : ""}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-background border border-border rounded-md">
                                                            <Layers className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">{chapter.name}</h3>
                                                            <p className="text-xs text-muted-foreground">{chapter.description}</p>
                                                            {chapter.navPath && (
                                                                <p className="text-[10px] text-primary font-mono mt-1">Path: {chapter.navPath}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(chapter)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(chapter._id!, chapter.name)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {chapters.length === 0 && (
                                            <p className="text-center text-muted-foreground py-8">No topics found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}
