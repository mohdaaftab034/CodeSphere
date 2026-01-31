import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Code2,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "../hooks/useQuery";
import { fetchChaptersConfig } from "../lib/chapters";
import { interviewRoles } from "../lib/interviewRoles";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Notes", href: "/notes", hasDropdown: true },
  { label: "Interview", href: "/interview", hasDropdown: true },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const iconMap: Record<string, any> = { Code2, BookOpen, Briefcase, Users };

  const fetchChapters = useCallback(() => fetchChaptersConfig(), []);
  const { data: chaptersResp } = useQuery(fetchChapters);

  const notesDropdownItems = useMemo(() => {
    const list = chaptersResp || [];
    const items = [
      {
        label: "All Chapters",
        href: "/notes",
        icon: BookOpen,
        color: "text-primary",
      },
    ];
    list.forEach((ch: any) => {
      items.push({
        label: ch.name,
        href: `/notes/${ch.id}`,
        icon: iconMap[ch.icon || "BookOpen"] || BookOpen,
        color: "text-primary",
      });
    });
    items.push({
      label: "Handwritten Notes",
      href: "/handwritten-notes",
      icon: FileText,
      color: "text-amber-600",
      divider: true,
    });
    return items;
  }, [chaptersResp]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const mobileMenuVariants = {
    closed: { height: 0, opacity: 0 },
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const mobileItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-primary/20">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span
            className="font-semibold text-foreground text-lg tracking-tight"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            CodeNotes
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1 relative">
          {navItems.map((item, index) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => {
                setHoveredIndex(index);
                if (item.hasDropdown) setDropdownOpen(true);
              }}
              onMouseLeave={() => {
                // Logic handled in dropdown mouse leave usually, keeping simple here
              }}
            >
              <Link
                to={item.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
              >
                <span className="relative z-10">{item.label}</span>
                {item.hasDropdown && (
                  <ChevronDown
                    className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                      dropdownOpen && hoveredIndex === index
                        ? "rotate-180 text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                )}
                {/* Hover Background Pill */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-secondary/80 rounded-full -z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>

              {/* Notes Dropdown */}
              <AnimatePresence>
                {item.hasDropdown &&
                  item.label === "Notes" &&
                  dropdownOpen &&
                  hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                      className="fixed left-0 right-0 top-[64px] bg-background/95 backdrop-blur-3xl border-b border-border shadow-2xl z-50 origin-top"
                      onMouseLeave={() => {
                        setDropdownOpen(false);
                        setHoveredIndex(null);
                      }}
                    >
                      <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Quick Access Section */}
                          <div className="lg:col-span-1 space-y-6">
                            <div>
                              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                                Quick Access
                              </h3>
                              {notesDropdownItems.length > 0 && (
                                <Link
                                  to={notesDropdownItems[0].href}
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    setHoveredIndex(null);
                                  }}
                                  className="group relative flex items-center gap-4 px-5 py-4 rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 overflow-hidden"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors text-primary">
                                    <BookOpen className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-foreground">
                                      {notesDropdownItems[0].label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Explore comprehensive guides
                                    </div>
                                  </div>
                                </Link>
                              )}
                            </div>

                            {notesDropdownItems.some(
                              (item: any) => item.divider,
                            ) && (
                              <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                                  Extras
                                </h3>
                                {notesDropdownItems
                                  .filter((item: any) => item.divider)
                                  .map((subItem: any) => (
                                    <Link
                                      key={subItem.label}
                                      to={subItem.href}
                                      onClick={() => {
                                        setDropdownOpen(false);
                                        setHoveredIndex(null);
                                      }}
                                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/80 transition-all border border-transparent hover:border-border"
                                    >
                                      <subItem.icon
                                        className={`w-4 h-4 ${subItem.color}`}
                                      />
                                      <span className="font-medium text-sm">
                                        {subItem.label}
                                      </span>
                                    </Link>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* All Chapters Grid */}
                          <div className="lg:col-span-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-1">
                              All Topics
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {notesDropdownItems
                                .slice(1)
                                .filter((item: any) => !item.divider)
                                .map((subItem: any) => (
                                  <Link
                                    key={subItem.label}
                                    to={subItem.href}
                                    onClick={() => {
                                      setDropdownOpen(false);
                                      setHoveredIndex(null);
                                    }}
                                    className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all duration-200"
                                  >
                                    <div className="p-1.5 rounded-md bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
                                      <subItem.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground group-hover:translate-x-1 transition-transform">
                                      {subItem.label}
                                    </span>
                                  </Link>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                {/* Interview Dropdown */}
                {item.hasDropdown &&
                  item.label === "Interview" &&
                  dropdownOpen &&
                  hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                      className="fixed left-0 right-0 top-[64px] bg-background/95 backdrop-blur-3xl border-b border-border shadow-2xl z-50 origin-top"
                      onMouseLeave={() => {
                        setDropdownOpen(false);
                        setHoveredIndex(null);
                      }}
                    >
                      <div className="container mx-auto px-8 py-8">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
                          Select a Role
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {interviewRoles.map((role) => (
                            <Link
                              key={role.id}
                              to={`/interview/${role.id}`}
                              onClick={() => {
                                setDropdownOpen(false);
                                setHoveredIndex(null);
                              }}
                              className="group relative flex flex-col p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${role.color} bg-opacity-10 group-hover:scale-110 transition-transform`}
                              >
                                <role.icon className="w-4 h-4 text-foreground" />
                              </div>
                              <h4 className="font-semibold text-sm mb-1">
                                {role.name}
                              </h4>
                              <p className="text-[11px] text-muted-foreground line-clamp-2">
                                {role.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hover:bg-secondary"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full px-6 shadow-md hover:shadow-lg transition-all"
              >
                <Link to="/notes">Start Learning</Link>
              </Button>
            </>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setProfileDropdownOpen(true)}
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <button className="p-2 rounded-full hover:bg-secondary transition-colors border border-transparent hover:border-border">
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-background border border-border shadow-xl overflow-hidden z-50 p-1"
                  >
                    {/* ... Profile menu items (kept logic same, just structure) ... */}
                    <div className="flex flex-col gap-1">
                      {isAdmin ? (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Users className="w-4 h-4" /> My Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Settings className="w-4 h-4" /> Dashboard
                          </Link>
                        </>
                      )}
                      <hr className="border-border/50 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          window.location.href = "/login";
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 transition-colors text-left w-full"
                      >
                        <X className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-background border-b border-border overflow-hidden max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  <motion.div variants={mobileItemVariants}>
                    <Link
                      to={item.href}
                      className="flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-colors"
                      onClick={() =>
                        !item.hasDropdown && setMobileMenuOpen(false)
                      }
                    >
                      {item.label}
                      {item.hasDropdown && (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Link>
                  </motion.div>
                  
                  {/* Notes Dropdown Items */}
                  {item.hasDropdown && item.label === "Notes" && (
                    <div className="pl-4 pr-2 mt-1 space-y-1 border-l-2 border-border/50 ml-4">
                      {notesDropdownItems.map((subItem: any) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                        >
                          <subItem.icon className={`w-4 h-4 ${subItem.color}`} />
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Interview Roles Dropdown */}
                  {item.hasDropdown && item.label === "Interview" && (
                    <div className="pl-4 pr-2 mt-1 space-y-1 border-l-2 border-border/50 ml-4">
                      {interviewRoles.map((role) => (
                        <Link
                          key={role.id}
                          to={`/interview/${role.id}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                        >
                          <role.icon className="w-4 h-4" />
                          {role.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <motion.div
                variants={mobileItemVariants}
                className="pt-4 mt-4 border-t border-border space-y-2"
              >
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-center"
                    >
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log In
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-center">
                      <Link
                        to="/notes"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Start
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </>
                    )}
                    <Button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        window.location.href = "/login";
                      }}
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      <X className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
