import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useNavigate } from "react-router-dom"
import {
    Layers,
    Layout,
    Server,
    Cloud,
    Cpu,
    ArrowRight,
    Loader2
} from "lucide-react"
import { roadmapsAPI } from "../lib/api"

const iconMap: Record<string, any> = { Layers, Layout, Server, Cloud, Cpu }

export default function RoadmapListingPage() {
    const websiteName = import.meta.env.VITE_WEBSITE_NAME
    const navigate = useNavigate()
    const [roadmaps, setRoadmaps] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        document.title = `Roadmaps | ${websiteName}`
    }, [websiteName])

    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const data = await roadmapsAPI.getAll("published")
                setRoadmaps(data)
            } catch (error) {
                console.error("Error fetching roadmaps:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRoadmaps()
    }, [])

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-grow pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground" style={{ fontFamily: "var(--font-cal-sans)" }}>
                            Developer Roadmaps
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Step-by-step guides to help you master your career path.
                            Choose a track to get started.
                        </p>
                    </div>

                    {/* Loader */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse">Loading Roadmaps...</p>
                        </div>
                    ) : (
                        /* Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roadmaps.length > 0 ? (
                                roadmaps.map((roadmap, index) => {
                                    const Icon = iconMap[roadmap.icon] || Layers

                                    return (
                                        <motion.div
                                            key={roadmap._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                                            onClick={() => navigate(`/roadmap/${roadmap._id}`)}
                                        >
                                            <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity`} />

                                            <div className="relative z-10">
                                                <div className={`w-14 h-14 rounded-xl ${(roadmap.color || 'text-primary').replace('text-', 'bg-')}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                                    <Icon className={`w-7 h-7 ${roadmap.color || 'text-primary'}`} />
                                                </div>

                                                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                                    {roadmap.title}
                                                </h3>

                                                <p className="text-muted-foreground mb-8 min-h-[3rem]">
                                                    {roadmap.description}
                                                </p>

                                                <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
                                                    View Roadmap <ArrowRight className="w-4 h-4 ml-2" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="col-span-full text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                                    <p className="text-muted-foreground">No roadmaps available at the moment.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </main>
    )
}
