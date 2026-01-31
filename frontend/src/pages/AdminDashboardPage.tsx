import { useEffect, useState, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BarChart3, Users, BookOpen, MessageSquare, TrendingUp, Briefcase, FileText } from "lucide-react"
import { Button } from "../components/ui/button"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../contexts/AuthContext"
import { usersAPI } from "../lib/api"
import { useQuery } from "../hooks/useQuery"

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  useEffect(() => {
    // Check if admin is authenticated
    if (!user || user.role !== "admin") {
      navigate("/login")
    }
  }, [user, navigate])

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    if (!token) return null
    const response = await usersAPI.getStats(token)
    return response.data
  }, [token])

  const { data: statsData, isLoading, error } = useQuery(fetchStats, {
    enabled: Boolean(token),
  })

  const stats = statsData
    ? [
        { label: "Total Users", value: statsData.totalUsers.toString(), icon: Users, color: "text-blue-500" },
        { label: "Total Notes", value: statsData.totalNotes.toString(), icon: BookOpen, color: "text-emerald-500" },
        { label: "Interview Questions", value: statsData.totalQuestions.toString(), icon: Briefcase, color: "text-pink-500" },
        { label: "Growth Rate", value: statsData.growthRate, icon: TrendingUp, color: "text-orange-500" },
      ]
    : [
        { label: "Total Users", value: "0", icon: Users, color: "text-blue-500" },
        { label: "Total Notes", value: "0", icon: BookOpen, color: "text-emerald-500" },
        { label: "Interview Questions", value: "0", icon: Briefcase, color: "text-pink-500" },
        { label: "Growth Rate", value: "0%", icon: TrendingUp, color: "text-orange-500" },
      ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard Overview</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading statistics...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Failed to load statistics</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Admin Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Users Management */}
          <div className="p-8 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Users Management</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              View, manage, and monitor all registered users on the platform.
            </p>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/admin/users">Manage Users →</Link>
            </Button>
          </div>

          {/* Content Management */}
          <div className="p-8 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Notes Management</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Create, edit, and manage all educational notes and content.
            </p>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/admin/notes">Manage Notes →</Link>
            </Button>
          </div>

          {/* Analytics */}
          <div className="p-8 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Track platform metrics, user engagement, and growth statistics.
            </p>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View Analytics →
            </Button>
          </div>

          {/* Interview Content */}
          <div className="p-8 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Interview Content</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage interview questions and answers by role.
            </p>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/admin/interviews">Manage Interviews →</Link>
            </Button>
          </div>

          {/* Handwritten PDFs */}
          <div className="p-8 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Handwritten PDFs</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Upload and manage PDF notes for students.
            </p>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/admin/pdfs">Manage PDFs →</Link>
            </Button>
          </div>

          {/* Feedback */}
          <div className="p-8 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Feedback</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Review and respond to user feedback and feature requests.
            </p>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View Feedback →
            </Button>
          </div>
        </motion.div>
        </main>
      </div>
    </AdminLayout>
  )
}
