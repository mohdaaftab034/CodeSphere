import { ReactNode, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Briefcase,
  FileText,
  FileStack,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  Code2,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { useState } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Notes", href: "/admin/notes", icon: BookOpen },
  { label: "Interview Content", href: "/admin/interviews", icon: Briefcase },
  { label: "Handwritten PDFs", href: "/admin/pdfs", icon: FileText },
  { label: "Roadmaps", href: "/admin/roadmaps", icon: Map },
  { label: "Pages", href: "/admin/pages", icon: FileStack },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if admin is authenticated
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    if (!isAdmin) {
      navigate("/login")
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("userEmail")
    navigate("/login")
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-border bg-card fixed left-0 top-0 h-screen">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-lg">Admin Panel</span>
            <p className="text-xs text-muted-foreground">{import.meta.env.VITE_WEBSITE_NAME}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card lg:hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-lg">Admin Panel</span>
                <p className="text-xs text-muted-foreground">{}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </motion.aside>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Admin Panel</span>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">{children}</main>
      </div>
    </div>
  )
}
