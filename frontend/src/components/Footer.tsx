import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Learn: [
    { label: "JavaScript", href: "/notes?category=javascript" },
    { label: "React", href: "/notes?category=react" },
    { label: "Interview Prep", href: "/interview" },
  ],
  Resources: [
    { label: "All Notes", href: "/notes" },
    { label: "Roadmaps", href: "/roadmaps" },
    { label: "Login", href: "/login" },
  ],
  Company: [
    { label: "Contact", href: "/contact" },
    { label: "Feedback", href: "/feedback" }, // Feedback link restored
    { label: "Terms", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer
      ref={ref}
      className="relative border-t border-border bg-background pt-10 pb-6 overflow-hidden"
    >
      {/* Background Decorative Element */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-primary/5 blur-[80px] rounded-full -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8"
        >
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:rotate-3 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span
                className="font-bold text-lg tracking-tight"
                style={{ fontFamily: "var(--font-cal-sans)" }}
              >
                CodeNotes
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-[280px]">
              Master full-stack concepts with clarity and depth. Designed for
              the real-world engineer.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="p-1.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground hover:text-primary transition-all"
                >
                  <link.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {Object.entries(footerLinks).map(([title, links], idx) => (
              <div key={title} className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="group flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-all"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar - Even more compact */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} CodeNotes</span>
            <span className="opacity-20">|</span>
            <span className="flex items-center gap-1">
              Made with{" "}
              <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500/10" /> for
              devs
            </span>
          </div>

          <div className="flex items-center gap-4">
            {["Privacy", "Terms"].map((text) => (
              <Link
                key={text}
                to={`/${text.toLowerCase()}`}
                className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
              >
                {text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
