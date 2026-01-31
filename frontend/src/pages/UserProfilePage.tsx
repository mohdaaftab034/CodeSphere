import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut, 
  Loader, 
  Settings,
  BookOpen,
  FileText,
  Award,
  Copy,
  Check
} from "lucide-react"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { usersAPI } from "../lib/api"

export default function UserProfilePage() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    const fetchProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await usersAPI.getDashboard(token)
        console.log("Profile data:", response)
        setProfileData(response.data)
      } catch (err) {
        console.error("Failed to fetch profile data:", err)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [token, navigate])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Loader className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Not Logged In</h1>
            <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const savedNotes = profileData?.savedNotes || []
  const savedPDFs = profileData?.savedPDFs || []
  const totalSaved = savedNotes.length + savedPDFs.length

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Avatar and Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/10 rounded-2xl border border-border p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="flex items-end gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full border-4 border-primary object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center border-4 border-primary">
                        <UserIcon className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <h1 
                      className="text-3xl md:text-4xl font-bold text-foreground mb-2" 
                      style={{ fontFamily: "var(--font-cal-sans)" }}
                    >
                      {user.name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="rounded-lg"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="rounded-lg"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Statistics Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div
              variants={item}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">{savedNotes.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Saved Notes</p>
            </motion.div>

            <motion.div
              variants={item}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <FileText className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">{savedPDFs.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Saved PDFs</p>
            </motion.div>

            <motion.div
              variants={item}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">{totalSaved}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Saved</p>
            </motion.div>

            <motion.div
              variants={item}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-semibold text-foreground capitalize">{user.role}</span>
              </div>
              <p className="text-sm text-muted-foreground">Account Role</p>
            </motion.div>
          </motion.div>

          {/* Account Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-8 mb-12"
          >
            <h2 
              className="text-2xl font-bold text-foreground mb-8" 
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Account Details
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-foreground">{user.name}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="text-primary hover:bg-primary/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Auth Provider */}
              <div className="flex items-start justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Shield className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Login Method</p>
                    <p className="text-lg font-semibold text-foreground capitalize">
                      {user.authProvider === "google" ? "Google Sign-in" : "Email & Password"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Role */}
              <div className="flex items-start justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                    <p className="text-lg font-semibold text-foreground capitalize">{user.role} User</p>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData?.createdAt ? formatDate(profileData.createdAt) : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Learning Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-8 mb-12"
          >
            <h2 
              className="text-2xl font-bold text-foreground mb-8" 
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Learning Progress
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Saved Notes */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Saved Notes</h3>
                {savedNotes.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {savedNotes.slice(0, 5).map((note: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{note.title || "Untitled Note"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Chapter: {note.chapter?.name || "General"}</p>
                      </div>
                    ))}
                    {savedNotes.length > 5 && (
                      <p className="text-xs text-muted-foreground pt-2">
                        +{savedNotes.length - 5} more saved notes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-lg bg-background border border-border border-dashed">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No saved notes yet</p>
                    <Button asChild variant="link" className="text-primary mt-2 h-auto p-0">
                      <a href="/notes">Browse notes</a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Saved PDFs */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Saved PDFs</h3>
                {savedPDFs.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {savedPDFs.slice(0, 5).map((pdf: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{pdf.title || "Untitled PDF"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pdf.category && <span>{pdf.category}</span>}
                          {pdf.category && pdf.level && <span> • </span>}
                          {pdf.level && <span>{pdf.level}</span>}
                        </p>
                      </div>
                    ))}
                    {savedPDFs.length > 5 && (
                      <p className="text-xs text-muted-foreground pt-2">
                        +{savedPDFs.length - 5} more saved PDFs
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-lg bg-background border border-border border-dashed">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No saved PDFs yet</p>
                    <Button asChild variant="link" className="text-primary mt-2 h-auto p-0">
                      <a href="/handwritten-notes">Browse PDFs</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Security & Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-8"
          >
            <h2 
              className="text-2xl font-bold text-foreground mb-8" 
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Security & Privacy
            </h2>

            <div className="space-y-6">
              {/* Session Info */}
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Active Session</h3>
                    <p className="text-sm text-muted-foreground mt-1">You are currently logged in</p>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                  </span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-foreground">
                  Your data is secure and encrypted. Read our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and <a href="/terms" className="text-primary hover:underline">Terms of Service</a> for more information.
                </p>
              </div>

              {/* Logout Button */}
              <Button 
                variant="destructive" 
                className="w-full rounded-lg"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout from All Devices
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
