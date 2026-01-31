import { motion, useInView } from "framer-motion"
import { useRef, useMemo, useCallback } from "react"
import { Code2, Atom, Layers, Book, Briefcase, ArrowRight, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"
import { useQuery } from "../hooks/useQuery"
import { fetchChaptersConfig, ChapterConfig } from "../lib/chapters"
import { Button } from "./ui/button"

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }

export function ChapterCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Fetch chapters from JSON config (single source of truth)
  const fetchChapters = useCallback(() => fetchChaptersConfig(), [])
  const { data: chaptersResponse, isLoading, error, refetch } = useQuery(fetchChapters)

  // Map backend icon names to lucide components
  const iconMap: Record<string, any> = {
    Code2,
    Atom,
    Layers,
    Book,
    Briefcase,
    BookOpen,
  }

  const chapters = useMemo(() => {
    const list: ChapterConfig[] = chaptersResponse || []
    // Filter out sub-chapters (those with parentId) - only show top-level chapters
    return list
      .filter((ch: ChapterConfig) => !ch.parentId)
      .map((ch: ChapterConfig) => {
        const IconComp = iconMap[ch.icon || ""] || BookOpen
        return {
          id: ch.id,
          title: ch.name,
          description: ch.description || "Explore topics in this chapter.",
          icon: IconComp,
          gradient: ch.gradient || "from-gray-500/80 to-gray-600/80",
          topicsCount: undefined as number | undefined,
        }
      })
      .sort((a: any, b: any) => a.title.localeCompare(b.title))
  }, [chaptersResponse])

  if (isLoading) {
    return (
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
              All Chapters
            </h1>
            <p className="text-muted-foreground">Pick a chapter to explore topic-wise notes.</p>
          </div>
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Failed to load chapters</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </section>
    )
  }

  if (chapters.length === 0) {
    return (
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
              All Chapters
            </h1>
            <p className="text-muted-foreground">Pick a chapter to explore topic-wise notes.</p>
          </div>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No chapters available</h3>
            <p className="text-muted-foreground mb-6">No chapters have been created yet.</p>
            <Button variant="outline" onClick={refetch} className="bg-transparent">
              Refresh
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
            All Chapters
          </h1>
          <p className="text-muted-foreground">Pick a chapter to explore topic-wise notes.</p>
        </motion.div>

        <motion.div ref={ref} variants={containerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((ch) => (
            <motion.div key={ch.id} variants={itemVariants} whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <Link to={`/notes/${ch.id}`} className="block h-full">
                <div className="group relative h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${ch.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${ch.gradient} bg-opacity-10`}>
                      <ch.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{ch.title}</h3>
                      <p className="text-sm text-muted-foreground">{ch.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                    {typeof ch.topicsCount === "number" && (
                      <span className="text-sm text-muted-foreground">{ch.topicsCount} topics</span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
