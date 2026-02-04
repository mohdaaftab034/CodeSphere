import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { NotesListing } from "../components/NotesListing"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "../hooks/useQuery"
import { getChapterById, getSubChapters } from "../lib/chapters"
import { motion } from "framer-motion"
import { Code2, Atom, Layers, Briefcase, ArrowRight, BookOpen } from "lucide-react"
import { useCallback, useMemo, useEffect } from "react"

export default function ChapterTopicsPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { chapterId } = useParams()

  // Fetch chapter info
  const fetchChapter = useCallback(async () => {
    if (!chapterId) return null
    return getChapterById(chapterId)
  }, [chapterId])

  const { data: chapter, isLoading: chapterLoading } = useQuery(fetchChapter, {
    enabled: !!chapterId,
  })

  // Fetch sub-chapters if this chapter has them
  const fetchSubChapters = useCallback(async () => {
    if (!chapterId) return []
    return getSubChapters(chapterId)
  }, [chapterId])

  const { data: subChapters = [], isLoading: subChaptersLoading } = useQuery(fetchSubChapters, {
    enabled: !!chapterId,
  })

  useEffect(() => {
    if (chapter?.title) {
      document.title = `${chapter.title} | ${websiteName}`
    } else {
      document.title = `Chapter Topics | ${websiteName}`
    }
  }, [chapter?.title, websiteName])

  // Icon map
  const iconMap: Record<string, any> = {
    Code2,
    Atom,
    Layers,
    Briefcase,
    BookOpen,
  }

  const hasSubChapters = chapter && chapter.hasSubChapters && subChapters && subChapters.length > 0

  // Show loading state while chapter data is loading
  if (chapterLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16 px-4">
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  // If this chapter has sub-chapters, show them
  if (hasSubChapters) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
                {chapter?.name}
              </h1>
              <p className="text-muted-foreground">{chapter?.description || "Explore topics in this chapter."}</p>
            </motion.div>

            {(chapterLoading || subChaptersLoading) ? (
              <div className="text-center py-16">
                <div className="inline-block">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subChapters.map((subChapter: any) => {
                  const IconComponent = iconMap[subChapter.icon || 'BookOpen'] || BookOpen
                  return (
                    <motion.div
                      key={subChapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3, scale: 1.005 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Link to={`/notes/${subChapter.id}`} className="block h-full">
                        <div className="group relative h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${subChapter.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${subChapter.gradient} bg-opacity-10`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground mb-1">{subChapter.name}</h3>
                              <p className="text-sm text-muted-foreground">{subChapter.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end pt-4 mt-4 border-t border-border">
                            <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Explore <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  // Otherwise, show notes listing for this chapter
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotesListing initialChapterId={chapterId || undefined} />
      <Footer />
    </div>
  )
}
