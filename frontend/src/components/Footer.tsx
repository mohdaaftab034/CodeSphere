import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Instagram, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Explore: [
    { label: "All Notes", href: "/notes" },
    { label: "Roadmaps", href: "/roadmap" },
    { label: "Interview Prep", href: "/interview" },
    { label: "Handwritten Notes", href: "/handwritten-notes" },
  ],
  Company: [
    { label: "About Us", href: "/about" }, // Placeholder, we might need to route this if page exists
    { label: "Contact Us", href: "/contact" },
    { label: "Feedback", href: "/feedback" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy" }, // Using privacy for now
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600 hover:bg-blue-600/10 hover:border-blue-600/20" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600 hover:bg-pink-600/10 hover:border-pink-600/20" },
];

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer
      ref={ref}
      className="relative border-t border-border/40 bg-background/50 backdrop-blur-sm pt-16 pb-8 overflow-hidden"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 blur-[100px] rounded-full -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12"
        >
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:rotate-3 group-hover:scale-105 transition-all duration-300">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold text-xl tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-cal-sans)" }}
                >
                  {import.meta.env.VITE_WEBSITE_NAME}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Platform</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[320px]">
              The ultimate resource for developers. Master full-stack concepts, ace your interviews, and build your career with confidence.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -3 }}
                  className={`p-2 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground transition-all duration-300 ${link.color}`}
                >
                  <link.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="group flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-primary transition-all duration-200"
                      >
                        <span className="w-1.5 h-0.5 rounded-full bg-primary/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>&copy; {new Date().getFullYear()} {import.meta.env.VITE_WEBSITE_NAME}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> for developers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
