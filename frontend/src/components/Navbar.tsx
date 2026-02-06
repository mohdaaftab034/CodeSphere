import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
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
import { Layers, Layout, Server, Cloud, Cpu } from "lucide-react";
import { roadmapsAPI } from "../lib/api";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Notes", href: "/notes", hasDropdown: true },
  { label: "Interview", href: "/interview", hasDropdown: true },
  { label: "Roadmap", href: "/roadmap", hasDropdown: true },
];

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const iconMap: Record<string, any> = { Code2, BookOpen, Briefcase, Users, Layers, Layout, Server, Cloud, Cpu };

  const fetchChapters = useCallback(() => fetchChaptersConfig(), []);
  const { data: chaptersResp } = useQuery(fetchChapters);

  const avatar = user?.avatar || 'https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png';

  const notesDropdownItems = useMemo(() => {
    const list = chaptersResp || [];
    interface DropdownItem {
      label: string;
      href: string;
      icon: any;
      color: string;
      divider?: boolean;
    }

    const items: DropdownItem[] = [
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        const data = await roadmapsAPI.getAll("published");
        setRoadmaps(data || []);
      } catch (error) {
        console.error("Failed to load roadmaps", error);
      }
    };

    loadRoadmaps();
  }, []);

  // Animation variants
  const mobileMenuVariants = {
    closed: { x: "100%", transition: { type: "tween", duration: 0.25 } },
    open: {
      x: 0,
      transition: { type: "tween", duration: 0.3, staggerChildren: 0.06, delayChildren: 0.08 },
    },
  };

  const mobileOverlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.25 } },
  };

  const mobileItemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  if (!isMounted) {
    return null;
  }

  const headerContent = (
    <>
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${scrolled
        ? "bg-background/60 backdrop-blur-2xl border-b border-border/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Modern Interactive Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-600 rounded-xl opacity-20 group-hover:opacity-100 group-hover:rotate-6 transition-all duration-500 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-600 rounded-xl opacity-90 group-hover:rotate-3 transition-all duration-300" />

            {/* Icon */}
            <Code2 className="relative w-6 h-6 text-white transform transition-transform group-hover:scale-110 duration-300" />
          </div>
          <div className="flex flex-col">
            <span
              className="font-bold text-foreground text-xl leading-none tracking-tight group-hover:text-primary transition-colors duration-300"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              {import.meta.env.VITE_WEBSITE_NAME}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500">
              Platform
            </span>
          </div>
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
                className="relative px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group rounded-full"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">{item.label}</span>
                {item.hasDropdown && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${dropdownOpen && hoveredIndex === index
                      ? "rotate-180 text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                      }`}
                  />
                )}
                {/* Hover Background Pill with subtle border */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-primary/5 border border-primary/10 rounded-full -z-0 shadow-[0_1px_5px_rgba(0,0,0,0.02)]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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
                      className="fixed left-0 right-0 top-[80px] bg-background/95 backdrop-blur-3xl border-b border-border shadow-2xl z-50 origin-top"
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

                {item.hasDropdown &&
                  item.label === "Interview" &&
                  dropdownOpen &&
                  hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                      className="fixed left-0 right-0 top-[80px] bg-background/95 backdrop-blur-3xl border-b border-border shadow-2xl z-50 origin-top"
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
                              <p className="text-muted-foreground text-[11px] line-clamp-2">
                                {role.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                {/* Roadmap Dropdown */}
                {item.hasDropdown &&
                  item.label === "Roadmap" &&
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
                          Explore Roadmaps
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {roadmaps.map((roadmap) => {
                            const Icon = iconMap[roadmap.icon] || Layers;
                            return (
                              <Link
                                key={roadmap._id}
                                to={`/roadmap/${roadmap._id}`}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  setHoveredIndex(null);
                                }}
                                className="group relative flex flex-col p-4 rounded-xl border border-border/50 hover:border-blue-500/30 bg-card hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-blue-500/10 group-hover:scale-110 transition-transform`}
                                >
                                  {Icon && <Icon className={`w-4 h-4 ${roadmap.color || "text-primary"}`} />}
                                </div>
                                <h4 className="font-semibold text-sm mb-1">
                                  {roadmap.title}
                                </h4>
                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                  {roadmap.description}
                                </p>
                              </Link>
                            )
                          })}
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
              className="relative z-50"
              onMouseEnter={() => setProfileDropdownOpen(true)}
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_15px_-3px_rgba(var(--primary-rgb),0.3)]">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
              </div>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute top-full right-0 mt-3 w-72 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden z-50"
                  >
                    {/* User Header */}
                    <div className="p-4 bg-muted/30 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{user.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {isAdmin ? (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                        >
                          <div className="p-1.5 rounded-lg bg-background border border-border group-hover:border-primary/20 transition-colors">
                            <Settings className="w-4 h-4" />
                          </div>
                          Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                          >
                            <div className="p-1.5 rounded-lg bg-background border border-border group-hover:border-primary/20 transition-colors">
                              <Layout className="w-4 h-4" />
                            </div>
                            Dashboard
                          </Link>

                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                          >
                            <div className="p-1.5 rounded-lg bg-background border border-border group-hover:border-primary/20 transition-colors">
                              <Users className="w-4 h-4" />
                            </div>
                            My Profile
                          </Link>
                        </>
                      )}

                      <div className="h-px bg-border/50 my-1 mx-2" />

                      <button
                        onClick={() => {
                          logout();
                          window.location.href = "/login";
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all w-full text-left group"
                      >
                        <div className="p-1.5 rounded-lg bg-background border border-border group-hover:border-red-200 dark:group-hover:border-red-900/30 transition-colors">
                          <X className="w-4 h-4" />
                        </div>
                        Logout
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

    </motion.header>

    {/* Mobile Menu */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            variants={mobileOverlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[1000]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed top-0 right-0 h-full w-[82vw] max-w-sm bg-background border-l border-border shadow-2xl z-[1010] overflow-y-auto"
          >
            <div className="px-4 pt-24 pb-6 space-y-2">
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
        </>
      )}
    </AnimatePresence>
    </>
  );

  return createPortal(headerContent, document.body);
}
