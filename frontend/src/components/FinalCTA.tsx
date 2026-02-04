import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, type: "spring" }}
        className="max-w-5xl mx-auto"
      >
        <div className="relative p-12 sm:p-20 rounded-md bg-primary overflow-hidden text-center shadow-2xl shadow-primary/30">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50" />

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-white/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-40 -right-20 w-96 h-96 bg-indigo-300/30 rounded-full blur-[100px]"
          />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8">
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-medium">
                Join 5,000+ developers
              </span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Ready to Master
              <br />
              The Code?
            </h2>
            <p className="text-primary-foreground/90 max-w-xl mx-auto mb-10 text-lg sm:text-xl font-light leading-relaxed">
              Stop memorizing and start understanding. Get instant access to
              structured notes, interview patterns, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              {/* Shimmer Button */}
              <div className="relative group rounded-xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <Button
                  asChild
                  size="lg"
                  className="relative bg-white text-primary hover:bg-gray-50 rounded-xl px-8 h-14 text-base font-bold shadow-xl min-w-[200px]"
                >
                  <Link to="/roadmap" className="flex items-center gap-2">
                    Start Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl px-8 h-14 text-base font-medium border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-transparent min-w-[200px]"
              >
                <Link to="/notes">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Browse Notes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
