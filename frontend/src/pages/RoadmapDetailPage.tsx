import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import {
    ArrowLeft,
    Download,
    Bookmark,
    BookmarkCheck,
    Layers,
    Layout,
    Server,
    Cloud,
    Cpu,
    ChevronDown,
    Loader2,
    BookOpen,
    Lock
} from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { roadmapsAPI } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import SubscriptionModal from "../components/SubscriptionModal"

const iconMap: Record<string, any> = { Layers, Layout, Server, Cloud, Cpu }

// Recursive Node Component for User View
function RoadmapTreeNode({ node, index, depth = 0 }: { node: any; index: number; depth?: number }) {
    const [isExpanded, setIsExpanded] = useState(depth < 1) // Expand first level by default
    const hasChildren = node.children && node.children.length > 0

    return (
        <div className="relative">
            {/* Vertical Connector for children */}
            {isExpanded && hasChildren && (
                <div className="absolute left-[20px] top-[48px] bottom-[12px] w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
            )}

            <div className="flex items-start gap-4 mb-2 group">
                {/* Path Indicator / Step Number */}
                <div className="relative z-10 flex flex-col items-center">
                    <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm
                            ${depth === 0
                                ? 'bg-primary border-primary text-primary-foreground font-bold text-base scale-110 shadow-primary/20'
                                : 'bg-card border-border text-muted-foreground group-hover:border-primary/40 group-hover:text-primary'
                            }`}
                    >
                        {depth === 0 ? (
                            String(index + 1).padStart(2, '0')
                        ) : (
                            <div className={`w-2 h-2 rounded-full ${node.status === 'published' ? 'bg-primary/60' : 'bg-muted-foreground/30'}`} />
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <div
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                            ${isExpanded
                                ? 'bg-card border-primary/20 shadow-sm'
                                : 'bg-card/40 border-border hover:border-primary/20 hover:bg-card/60'
                            }`}
                        onClick={() => {
                            if (!hasChildren && node.resourceLink) {
                                window.open(node.resourceLink, "_blank", "noopener,noreferrer")
                                return
                            }
                            if (hasChildren) {
                                setIsExpanded(!isExpanded)
                            }
                        }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3
                                    className={`font-semibold transition-colors
                                        ${depth === 0 ? 'text-xl' : 'text-base'}
                                        ${isExpanded ? 'text-primary' : 'text-foreground'}
                                    `}
                                >
                                    {node.title}
                                </h3>
                                {node.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">
                                        {node.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {node.resourceLink && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/20 text-primary transition-all hover:scale-110"
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a href={node.resourceLink} target="_blank" rel="noopener noreferrer" title="View Resource">
                                            <BookOpen size={14} />
                                        </a>
                                    </Button>
                                )}
                                {hasChildren && (
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Direct Resource Link if it's a leaf node and not expanded */}
                        {!isExpanded && node.resourceLink && (
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-primary uppercase tracking-wider">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                Resource Available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="ml-[20px] pl-[32px] space-y-4 mb-8"
                    >
                        {node.children.map((child: any, idx: number) => (
                            <RoadmapTreeNode key={child._id} node={child} index={idx} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}



export default function RoadmapDetailPage() {
    const websiteName = import.meta.env.VITE_WEBSITE_NAME
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { token, isPaid, user } = useAuth()
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
    const [roadmap, setRoadmap] = useState<any>(null)
    const [nodes, setNodes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (roadmap?.title) {
            document.title = `${roadmap.title} | ${websiteName}`
        } else {
            document.title = `Roadmap | ${websiteName}`
        }
    }, [roadmap?.title, websiteName])

    useEffect(() => {
        if (id) {
            fetchData(id)
        }
    }, [id])

    const fetchData = async (roadmapId: string) => {
        setIsLoading(true)
        try {
            const [roadmapData, nodesData] = await Promise.all([
                roadmapsAPI.getById(roadmapId),
                roadmapsAPI.getNodes(roadmapId, "published")
            ])
            setRoadmap(roadmapData)
            setNodes(nodesData)
        } catch (error) {
            console.error("Error fetching roadmap details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to build tree from flat list (published nodes only)
    const buildTree = (flatNodes: any[]) => {
        const map = new Map()
        const roots: any[] = []

        flatNodes.forEach(node => map.set(node._id, { ...node, children: [] }))

        flatNodes.forEach(node => {
            if (node.parentId && map.has(node.parentId)) {
                map.get(node.parentId).children.push(map.get(node._id))
            } else {
                roots.push(map.get(node._id))
            }
        })

        const sortByOrder = (arr: any[]) => {
            arr.sort((a, b) => (a.order || 0) - (b.order || 0))
            arr.forEach(item => sortByOrder(item.children))
        }
        sortByOrder(roots)
        return roots
    }

    const tree = buildTree(nodes)

    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownloadPdf = async () => {
        if (!isPaid && user?.role !== "admin") {
            setIsSubscriptionModalOpen(true)
            return
        }

        if (!id || !token) return

        setIsDownloading(true)
        try {
            const blob = await roadmapsAPI.downloadAsPDF(id, token)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            // Use standard roadmap file name format
            const fileName = roadmap?.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "roadmap"
            a.download = `${fileName}-roadmap.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            toast.success("Roadmap PDF downloaded successfully!")
        } catch (error: any) {
            console.error("Download failed:", error)
            toast.error(error.message || "Failed to download roadmap PDF")
        } finally {
            setIsDownloading(false)
        }
    }

    const toggleSave = async () => {
        if (!token || !id) {
            // Could redirect to login here
            return
        }

        setIsSaving(true)
        try {
            if (isSaved) {
                await roadmapsAPI.unsaveRoadmap(token, id)
                setIsSaved(false)
            } else {
                await roadmapsAPI.saveRoadmap(token, id)
                setIsSaved(true)
            }
        } catch (error) {
            console.error("Error toggling save:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Building your roadmap...</p>
            </div>
        )
    }

    if (!roadmap) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <p className="text-xl font-medium text-muted-foreground">Roadmap not found</p>
                <Button onClick={() => navigate("/roadmap")}>Go Back to Roadmaps</Button>
            </div>
        )
    }

    const Icon = iconMap[roadmap.icon] || Layers

    return (
        <main className="min-h-screen bg-background print:bg-white overflow-x-hidden">
            <div className="print:hidden">
                <Navbar />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 print:pt-4 print:pb-4">
                {/* Header / Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 print:hidden">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/roadmap")}
                            className="bg-secondary/50 hover:bg-secondary rounded-full w-10 h-10 p-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                {roadmap.title}
                                <div className={`w-8 h-8 rounded-lg ${roadmap.color?.replace('text-', 'bg-') || 'bg-primary'}/10 flex items-center justify-center`}>
                                    <Icon size={18} className={roadmap.color || 'text-primary'} />
                                </div>
                            </h1>
                            <p className="text-muted-foreground mt-1 max-w-xl">{roadmap.description}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="gap-2 rounded-full"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                isPaid || user?.role === "admin" ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />
                            )}
                            {isDownloading ? "Generating..." : "Download Roadmap PDF"}
                        </Button>
                        <Button
                            variant={isSaved ? "secondary" : "outline"}
                            onClick={toggleSave}
                            disabled={isSaving}
                            className={`gap-2 rounded-full ${isSaved ? "text-primary bg-primary/10 border-primary/20" : ""}`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSaved ? (
                                <BookmarkCheck className="w-4 h-4" />
                            ) : (
                                <Bookmark className="w-4 h-4" />
                            )}
                            {isSaved ? "Saved" : "Save Track"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Side: Dynamic Tree */}
                    <div className="lg:col-span-8">
                        <div className="relative">
                            <div className="space-y-12 print:hidden">
                                {tree.length === 0 ? (
                                    <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                                        <p className="text-muted-foreground">The curator is still adding content to this roadmap. Check back soon!</p>
                                    </div>
                                ) : (
                                    tree.map((rootNode, idx) => (
                                        <motion.div
                                            key={rootNode._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <RoadmapTreeNode node={rootNode} index={idx} />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Sidebar info */}
                    <div className="lg:col-span-4 space-y-8 print:hidden">
                        <div className="bg-card border border-border rounded-2xl p-6 sticky top-28 shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-6">About this Track</h4>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Download size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Updated Weekly</p>
                                        <p className="text-xs text-muted-foreground">Fresh content and links added regularly.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Interactive Learning</p>
                                        <p className="text-xs text-muted-foreground">Click on topics to expand and see resources.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-border">
                                <p className="text-sm text-center text-muted-foreground">
                                    Join 2,000+ students following this track.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="print:hidden">
                <Footer />
            </div>

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
            />
        </main>
    )
}
