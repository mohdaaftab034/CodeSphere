import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import {
  BookOpen,
  TrendingUp,
  FileText,
  Zap,
  ArrowRight,
  Clock,
  Calendar,
  Bookmark,
  Star,
  Download,
  Loader,
  Map
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { usersAPI } from "../lib/api"

export default function DashboardPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = `Dashboard | ${websiteName}`
  }, [websiteName])

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await usersAPI.getDashboard(token)
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const savedNotes = dashboardData?.savedNotes || []
  const savedPDFs = dashboardData?.savedPDFs || []
  const savedRoadmaps = dashboardData?.savedRoadmaps || []
  const totalSaved = savedNotes.length + savedPDFs.length + savedRoadmaps.length

  // Merge and sort for Recent Activity Feed (Latest 5 items)
  const recentActivity = [
    ...savedNotes.map((n: any) => ({ ...n, type: 'note', date: n.createdAt })),
    ...savedPDFs.map((p: any) => ({ ...p, type: 'pdf', date: p.createdAt })),
    ...savedRoadmaps.map((r: any) => ({ ...r, type: 'roadmap', date: r.createdAt }))
  ]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 10)

  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-12 px-4 max-w-7xl mx-auto">

        {/* 1. Hero / Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {currentDate}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {greeting}, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Ready to continue your learning? Here's an overview of your progress and latest resources.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/notes")}>
              Explore Notes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* 2. Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{totalSaved}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Bookmark className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> Top 10% of learners
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-blue-500/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saved Notes</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{savedNotes.length}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Learning materials</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-purple-500/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PDF Resources</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{savedPDFs.length}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Cheat sheets & guides</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-emerald-500/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saved Roadmaps</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{savedRoadmaps.length}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Map className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Learning paths</p>
          </div>
        </div>

        {/* 3. Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Recent Activity Feed (Merged) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Recall & Review</h2>
              <Link to="/profile" className="text-sm font-medium text-primary hover:underline">View Library</Link>
            </div>

            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item: any, idx: number) => (
                  <motion.div
                    key={`${item.type}-${item._id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group p-5 rounded-xl bg-card border border-border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(
                      item.type === 'note' ? `/notes/${item._id}` :
                      item.type === 'pdf' ? `/handwritten-notes/${item._id}` :
                      `/roadmap/${item._id}`
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Icon Box */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'note' ? 'bg-blue-500/10 text-blue-600' :
                        item.type === 'pdf' ? 'bg-purple-500/10 text-purple-600' :
                        'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {item.type === 'note' ? <BookOpen className="w-6 h-6" /> :
                         item.type === 'pdf' ? <FileText className="w-6 h-6" /> :
                         <Map className="w-6 h-6" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-md group-hover:text-primary transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.type === 'note' ? item.chapter?.name || "General Note" :
                               item.type === 'pdf' ? item.category || "PDF Resource" :
                               item.type === 'roadmap' ? "Learning Roadmap" : "Resource"}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>

                        {/* Footer / Actions for Item */}
                        <div className="mt-4 flex items-center gap-3">
                          <div className={`text-xs px-2 py-1 rounded font-medium ${
                            item.type === 'note' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            item.type === 'pdf' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {item.type === 'note' ? 'Note' : item.type === 'pdf' ? 'PDF' : 'Roadmap'}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                            {item.type === 'note' ? 'Read' :
                             item.type === 'pdf' ? 'Download' :
                             'Explore'} <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-card border border-border border-dashed rounded-xl">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-medium text-foreground">No activity yet</h3>
                  <p className="text-muted-foreground mb-4">Start exploring notes to build your dashboard.</p>
                  <Button onClick={() => navigate("/notes")}>Browse Content</Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Recommended */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/10 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" /> Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto py-3 bg-background/50 hover:bg-background hover:border-primary/50" onClick={() => navigate("/interview")}>
                  <div className="p-2 rounded bg-orange-500/10 text-orange-600 mr-3">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Practice Interviews</div>
                    <div className="text-xs text-muted-foreground">Test your knowledge</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto py-3 bg-background/50 hover:bg-background hover:border-primary/50" onClick={() => navigate("/handwritten-notes")}>
                  <div className="p-2 rounded bg-purple-500/10 text-purple-600 mr-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Find Cheat Sheets</div>
                    <div className="text-xs text-muted-foreground">Quick reference guides</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recommended / Tip of the Day (Static for now, could be dynamic) */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Daily Tip</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted">Beta</span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "Consistent practice beats intensity. Try to read just one note or question every day to build a habit."
              </p>
            </div>

          </div>

        </div>

      </div>
      <Footer />
    </main>
  )
}
