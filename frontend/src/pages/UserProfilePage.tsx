import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import {
  User as UserIcon,
  LogOut,
  Loader,
  Settings,
  BookOpen,
  FileText,
  Award,
  Copy,
  Check,
  Camera,
  LayoutDashboard,
  Map
} from "lucide-react"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { usersAPI } from "../lib/api"

export default function UserProfilePage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { user, token, logout, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Profile | ${websiteName}`
  }, [websiteName])

  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !token || !user) return

    const file = e.target.files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      const response = await usersAPI.uploadAvatar(token, file)

      // Update local user state
      if (response.success && response.data.avatar) {
        const updatedUser = { ...user, avatar: response.data.avatar }
        login(token, updatedUser)
      }
    } catch (err: any) {
      console.error("Failed to upload avatar:", err)
      setError(err.message || "Failed to upload avatar")
    } finally {
      setIsUploading(false)
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
  const savedRoadmaps = profileData?.savedRoadmaps || []
  const totalSaved = savedNotes.length + savedPDFs.length + savedRoadmaps.length




  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "library", label: "My Library", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Filter items for Overview (Recent)
  const recentNotes = savedNotes.slice(0, 2)
  const recentPDFs = savedPDFs.slice(0, 2)
  const recentRoadmaps = savedRoadmaps.slice(0, 2)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-28 space-y-8">
              {/* User Mini Profile */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary/10 overflow-hidden mb-4 relative group">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                  {user.role} User
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name.split(" ")[0]}!</h1>
                    <p className="text-muted-foreground mt-1">Here's what's happening with your learning journey.</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">{savedNotes.length}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">Saved Notes</p>
                      <p className="text-xs text-muted-foreground mt-1">Notes you've bookmarked</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                          <FileText className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">{savedPDFs.length}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">Saved PDFs</p>
                      <p className="text-xs text-muted-foreground mt-1">Resources for interview prep</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                          <Map className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">{savedRoadmaps.length}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">Saved Roadmaps</p>
                      <p className="text-xs text-muted-foreground mt-1">Learning paths</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                          <Award className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">{totalSaved}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">Total Resources</p>
                      <p className="text-xs text-muted-foreground mt-1">Items in your library</p>
                    </div>
                  </div>

                  {/* Recent Activity / Quick Access */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground">Jump Back In</h3>
                      <Button variant="link" onClick={() => setActiveTab("library")}>View All</Button>
                    </div>

                    {totalSaved === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">You haven't saved any items yet.</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate("/notes")}>Explore Notes</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentNotes.map((note: any, i: number) => (
                          <div key={`note-${i}`} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer"
                            onClick={() => navigate(`/notes/${note._id}`)}>
                            <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground truncate">{note.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{note.chapter?.name || "No Chapter"}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="hidden sm:flex">Read</Button>
                          </div>
                        ))}
                        {recentPDFs.map((pdf: any, i: number) => (
                          <div key={`pdf-${i}`} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer"
                            onClick={() => navigate(`/handwritten-notes/${pdf._id}`)}>
                            <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                              <FileText className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground truncate">{pdf.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{pdf.category || "PDF Resource"}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="hidden sm:flex">View</Button>
                          </div>
                        ))}
                        {recentRoadmaps.map((roadmap: any, i: number) => (
                          <div key={`roadmap-${i}`} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer"
                            onClick={() => navigate(`/roadmap/${roadmap._id}`)}>
                            <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
                              <Map className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground truncate">{roadmap.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{roadmap.description ? roadmap.description.substring(0, 40) : "Learning Path"}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="hidden sm:flex">Explore</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "library" && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">My Library</h2>
                    <p className="text-muted-foreground">Manage your saved notes and resources.</p>
                  </div>

                  <div className="space-y-8">
                    {/* Notes Section */}
                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" /> Saved Notes
                      </h3>
                      {savedNotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedNotes.map((note: any, i: number) => (
                            <div key={i} className="group p-5 rounded-xl bg-card border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all">
                              <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{note.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{note.chapter?.name || "General"}</span>
                                <span>•</span>
                                <span>{formatDate(note.createdAt || new Date().toISOString())}</span>
                              </div>
                              <Button size="sm" className="w-full" asChild>
                                <a href={`/notes/${note._id}`}>Continue Reading</a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No notes saved yet.</p>
                      )}
                    </section>

                    {/* PDFs Section */}
                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" /> Saved PDFs
                      </h3>
                      {savedPDFs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedPDFs.map((pdf: any, i: number) => (
                            <div key={i} className="group p-5 rounded-xl bg-card border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all">
                              <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{pdf.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600">{pdf.category || "Resource"}</span>
                                <span>•</span>
                                <span>{pdf.level || "All Levels"}</span>
                              </div>
                              <Button size="sm" variant="outline" className="w-full">
                                Download / View
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No PDFs saved yet.</p>
                      )}
                    </section>

                    {/* Roadmaps Section */}
                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5 text-emerald-500" /> Saved Roadmaps
                      </h3>
                      {savedRoadmaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedRoadmaps.map((roadmap: any, i: number) => (
                            <div key={i} className="group p-5 rounded-xl bg-card border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                              onClick={() => navigate(`/roadmap/${roadmap._id}`)}>
                              <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{roadmap.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">{roadmap.status || "Published"}</span>
                                <span>•</span>
                                <span>{formatDate(roadmap.createdAt || new Date().toISOString())}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{roadmap.description || "Learning roadmap"}</p>
                              <Button size="sm" className="w-full" asChild>
                                <a href={`/roadmap/${roadmap._id}`}>Explore Roadmap</a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No roadmaps saved yet.</p>
                      )}
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
                    <p className="text-muted-foreground">Manage your profile and preferences.</p>
                  </div>

                  <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                    {/* Avatar Settings */}
                    <div className="p-6 md:p-8">
                      <h3 className="text-lg font-semibold mb-6">Profile Picture</h3>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted overflow-hidden relative">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-12 h-12 text-muted-foreground/50" />
                            )}

                            {/* Spinner Over Image */}
                            {isUploading && (
                              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
                                <Loader className="w-8 h-8 text-primary animate-spin" />
                              </div>
                            )}
                          </div>
                          <label
                            htmlFor="avatar-upload-settings"
                            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg z-10"
                          >
                            <Camera className="w-4 h-4" />
                          </label>
                          <input
                            type="file"
                            id="avatar-upload-settings"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={handleAvatarUpload}
                          />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="font-medium">Upload a new photo</p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                            Recommended size: 400x400px. <br />
                            Allowed formats: JPG, PNG, WebP.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info Settings */}
                    <div className="p-6 md:p-8 space-y-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          disabled
                          className="w-full p-2.5 rounded-lg border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Name updates are currently disabled.</p>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            defaultValue={user.email}
                            disabled
                            className="flex-1 p-2.5 rounded-lg border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                          />
                          <Button variant="outline" size="icon" onClick={handleCopyEmail}>
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-6 md:p-8 bg-red-500/5">
                      <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">Irreversible actions for your account.</p>
                      <Button variant="destructive" onClick={handleLogout}>Log Out Everywhere</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
