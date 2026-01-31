import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { BookOpen, Bookmark, TrendingUp, FileText, Download, Eye, Lock, Loader } from "lucide-react"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { usersAPI } from "../lib/api"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"notes" | "pdfs">("pdfs")
  const { token } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        console.warn("No token available")
        setIsLoading(false)
        return
      }

      try {
        const response = await usersAPI.getDashboard(token)
        console.log("Dashboard response:", response)
        setDashboardData(response.data)
      } catch (err) {
        console.error("Failed to fetch dashboard:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [token])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Loader className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const savedNotes = dashboardData?.savedNotes || []
  const savedPDFs = dashboardData?.savedPDFs || []

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track your learning progress and manage your saved items</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[
              { icon: FileText, label: "Saved PDFs", value: savedPDFs.length.toString(), color: "text-blue-500" },
              { icon: BookOpen, label: "Saved Notes", value: savedNotes.length.toString(), color: "text-yellow-500" },
              { icon: TrendingUp, label: "Total Saved", value: (savedPDFs.length + savedNotes.length).toString(), color: "text-green-500" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saved Items Section */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-cal-sans)" }}>
                  My Saved Items
                </h2>
                <p className="text-muted-foreground">Your bookmarked notes and PDFs</p>
              </div>
              <Button asChild variant="outline" className="bg-transparent rounded-lg w-full sm:w-auto">
                <Link to="/handwritten-notes">
                  <FileText className="w-4 h-4 mr-2" />
                  Browse All Notes
                </Link>
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
              {[
                { key: "pdfs", label: "Handwritten PDFs" },
                { key: "notes", label: "Text Notes" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "notes" | "pdfs")}
                  className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Tabs */}
            {activeTab === "pdfs" ? (
              <div className="space-y-4">
                {savedPDFs.length > 0 ? (
                  savedPDFs.map((pdf: any, index: number) => (
                    <motion.div
                      key={pdf._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {pdf.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">{pdf.category}</span>
                            {pdf.downloads > 0 && <span>{pdf.downloads} downloads</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-lg bg-transparent"
                          >
                            <Link to={`/handwritten-notes/${pdf._id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No saved PDFs yet</p>
                    <Button asChild variant="outline" className="bg-transparent">
                      <Link to="/handwritten-notes">Browse Handwritten Notes</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {savedNotes.length > 0 ? (
                  savedNotes.map((note: any, index: number) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">{note.category}</span>
                            {note.chapter && <span>Chapter: {note.chapter}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-lg bg-transparent"
                          >
                            <Link to={`/notes/${note._id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No saved notes yet</p>
                    <Button asChild variant="outline" className="bg-transparent">
                      <Link to="/notes">Browse Text Notes</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
            <p className="text-muted-foreground">Your learning journey: Downloaded notes, bookmarks, and progress tracking will appear here.</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
