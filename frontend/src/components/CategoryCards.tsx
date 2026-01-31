import { motion, useInView } from "framer-motion";
import { useRef, useCallback, useMemo, useState } from "react";
import {
  Code2,
  Atom,
  Layers,
  Briefcase,
  ArrowRight,
  BookOpen,
  Book,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "../hooks/useQuery";
import { fetchChaptersConfig } from "../lib/chapters";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

export function CategoryCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Fetch chapters
  const fetchChapters = useCallback(() => fetchChaptersConfig(), []);
  const { data: chaptersResponse, isLoading } = useQuery(fetchChapters);

  const iconMap: Record<string, any> = {
    Code2,
    Atom,
    Layers,
    Book,
    Briefcase,
    BookOpen,
  };

  const chapters = useMemo(() => {
    const list = chaptersResponse || [];
    return list
      .filter((ch: any) => !ch.parentId)
      .map((ch: any) => ({
        title: ch.name,
        description: ch.description || "Explore topics in this chapter.",
        icon: iconMap[ch.icon || "BookOpen"] || BookOpen,
        href: `/notes/${ch.id}`,
        gradient: ch.gradient || "from-gray-500/80 to-gray-600/80",
        color: ch.color || "text-primary",
        slug: ch.id,
      }));
  }, [chaptersResponse]);

  return (
    <section className="py-24 px-4 bg-secondary/10 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 border border-primary/20">
            <Sparkles className="w-3 h-3" />
            <span>Structured Learning Path</span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            Explore by Chapter
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose your learning path. Each chapter contains comprehensive
            notes, examples, and practice problems designed to master the
            concept.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground animate-pulse">
                Loading chapters...
              </p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card/50 rounded-3xl border border-dashed border-border">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No chapters available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new content.
              </p>
            </div>
          ) : (
            chapters.map((chapter: any) => (
              <Card key={chapter.slug} chapter={chapter} />
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Separate Card Component for cleaner logic and hover state management
function Card({ chapter }: { chapter: any }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div variants={itemVariants} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className="h-full">
      <Link to={chapter.href} className="block h-full relative group">
        <div
          onMouseMove={handleMouseMove}
          className="relative h-full overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1"
        >
          {/* Spotlight Gradient Effect on Hover */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.1), transparent 40%)`,
            }}
          />

          {/* Gradient Top Border */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${chapter.gradient} opacity-80`}
          />

          <div className="p-6 flex flex-col h-full relative z-10">
            <div className="mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${chapter.gradient} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-300 inline-flex`}
              >
                <chapter.icon className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {chapter.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2 flex-grow">
              {chapter.description}
            </p>

            <div className="flex items-center text-sm font-semibold text-primary mt-auto">
              <span className="relative overflow-hidden group/link">
                Start Learning
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/link:w-full"></span>
              </span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>

          {/* Grain Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
      </Link>
    </motion.div>
  );
}
