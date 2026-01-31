import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, Code2, Sparkles, Terminal } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const textRevealVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for smooth "reveal"
    },
  }),
};

const stats = [
  { value: "500+", label: "Coding Notes" },
  { value: "50+", label: "Topics Covered" },
  { value: "10K+", label: "Learners" },
];

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    setMousePosition({ x: moveX, y: moveY });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[110vh] flex flex-col items-center justify-center px-4 pt-32 pb-16 overflow-hidden"
    >
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 110%)",
        }}
      />

      {/* Breathing Gradient Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-sm mb-8 hover:border-primary/50 transition-colors cursor-default"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-xs font-medium text-muted-foreground">
            Free coding notes for everyone
          </span>
        </motion.div>

        {/* Headline with Staggered Reveal */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-8"
          style={{ fontFamily: "var(--font-cal-sans)" }}
        >
          <span className="block overflow-hidden pb-2">
            <motion.span
              className="block"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Master Programming
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-4">
            <motion.span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              with Clear Notes
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Your ultimate resource for JavaScript, React, MERN stack, and
          technical interview preparation. Structured for clarity, built for
          developers.
        </motion.p>

        {/* CTAs with Shine Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            <Link to="/notes">
              <span className="relative z-10 flex items-center">
                Start Learning{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shimmer Effect */}
              <motion.div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-12 text-base font-medium border-border hover:bg-secondary/80 bg-background/50 backdrop-blur-sm transition-all hover:scale-105"
          >
            <Link to="/notes">
              <BookOpen className="mr-2 w-4 h-4" />
              Browse Notes
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-8 sm:gap-16 border-t border-border pt-8 max-w-3xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              className="text-center group cursor-default"
            >
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Parallax Icons */}
      <motion.div
        animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-20 left-10 lg:left-20"
        >
          <div className="bg-secondary/50 p-4 rounded-2xl backdrop-blur-md border border-border/50 rotate-12">
            <Code2 className="w-8 h-8 text-foreground/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="absolute top-40 right-10 lg:right-20"
        >
          <div className="bg-secondary/50 p-4 rounded-2xl backdrop-blur-md border border-border/50 -rotate-12">
            <Terminal className="w-8 h-8 text-foreground/50" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
