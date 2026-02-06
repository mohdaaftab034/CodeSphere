import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { interviewAPI } from "../lib/api"
import { Layers, Building2, Briefcase, ArrowRight } from "lucide-react"

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const CardSkeleton = () => (
  <div className="h-16 rounded-xl bg-card/50 border border-border/50 animate-pulse" />
)

export default function InterviewPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const [meta, setMeta] = useState({ roles: [], topics: [], companies: [], difficulties: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    document.title = `Interview Questions | ${websiteName}`
  }, [websiteName])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setIsLoading(true)
        const response = await interviewAPI.getMeta()
        setMeta(response.meta || { roles: [], topics: [], companies: [], difficulties: [] })
        setError("")
      } catch (err: any) {
        setError(err.message || "Failed to load interview filters")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeta()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -skew-y-2 transform origin-top-left scale-150 pointer-events-none opacity-50" />
          <div className="relative max-w-6xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm text-xs font-medium text-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Interview Prep Hub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
            >
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Next Interview</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Browse a curated collection of interview questions by topic, company, or role.
              Prepare smarter with detailed answers and code examples.
            </motion.p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-16 pb-20">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {!isLoading && error && (
            <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
              <p className="text-rose-500 font-medium">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Roles Section */}
              {meta.roles.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Explore by Role</h2>
                      <p className="text-sm text-muted-foreground">Target questions for specific job titles</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meta.roles.map((role: string, index) => (
                      <Link
                        key={role}
                        to={`/interview-questions/role/${slugify(role)}`}
                        className="group relative p-5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {role}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Topics Section */}
              {meta.topics.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Browse by Topic</h2>
                      <p className="text-sm text-muted-foreground">Focus on specific technical concepts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {meta.topics.map((topic: string) => (
                      <Link
                        key={topic}
                        to={`/interview-questions/${slugify(topic)}`}
                        className="group flex flex-col items-center justify-center p-4 text-center rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {topic}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Companies Section */}
              {meta.companies.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Target Companies</h2>
                      <p className="text-sm text-muted-foreground">Prepare for specific company styles</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {meta.companies.map((company: string) => (
                      <Link
                        key={company}
                        to={`/interview-questions/company/${slugify(company)}`}
                        className="px-4 py-3 rounded-lg border border-border bg-card/30 text-sm font-medium text-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-foreground/20 transition-all"
                      >
                        {company}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {!isLoading && !error && Object.values(meta).every(arr => arr.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Coming Soon</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                We are currently curating the best interview questions. Check back later!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
