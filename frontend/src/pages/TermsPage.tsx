import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import {
  Scale,
  BookOpen,
  UserCircle,
  Copyright,
  CreditCard,
  AlertTriangle,
  Ban,
  Gavel,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: "content",
      title: "Content Use",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "responsibilities",
      title: "User Duties",
      icon: <UserCircle className="w-4 h-4" />,
    },
    { id: "ip", title: "IP Rights", icon: <Copyright className="w-4 h-4" /> },
    {
      id: "payments",
      title: "Payments",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "liability",
      title: "Liability",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      id: "termination",
      title: "Termination",
      icon: <Ban className="w-4 h-4" />,
    },
    { id: "governing", title: "Legal", icon: <Gavel className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-background">
      <Navbar />

      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Scale className="w-3 h-3" /> Legal Agreement
          </motion.div>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground font-medium">
            Please read these terms carefully before using our platform.
          </p>
        </header>

        {/* TL;DR Summary Box */}
        <div className="mb-16 p-6 rounded-3xl bg-primary/5 border border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 pb-2 border-b border-primary/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              Quick Summary (TL;DR)
            </h3>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Notes are for personal use only. No commercial reselling.
            </p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Subscriptions renew automatically unless cancelled.
            </p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Be respectful. Abusive behavior leads to account termination.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4 ml-3">
                Navigation
              </p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                >
                  <span className="opacity-50 group-hover:opacity-100">
                    {section.icon}
                  </span>
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-16">
            <section id="acceptance" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the <strong>Coding Notes Platform</strong>{" "}
                (the “Service”), you agree to be bound by these Terms &
                Conditions and our Privacy Policy. If you do not agree to these
                terms, please do not access or use our Service.
              </p>
            </section>

            <section
              id="content"
              className="scroll-mt-32 p-8 rounded-3xl bg-card border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 text-primary">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Use of Content</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All educational content, handwritten notes, and code snippets
                provided are for{" "}
                <strong>personal, non-commercial use only</strong>. You may not:
              </p>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                  Redistribute on other platforms
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Modify
                  and sell as your own
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Scrape
                  content using bots
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Use
                  for training AI models
                </li>
              </ul>
            </section>

            <section id="payments" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Payments & Subscriptions</h2>
              </div>
              <div className="bg-secondary/30 p-6 rounded-2xl border border-border/50 text-sm text-muted-foreground space-y-4">
                <p>
                  Certain features require a paid subscription. Pricing and
                  billing cycles are clearly stated during checkout.
                </p>
                <div className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs italic">
                    Subscribers are billed on a recurring basis. You may cancel
                    at any time, but we do not offer partial refunds for
                    mid-cycle cancellations.
                  </p>
                </div>
              </div>
            </section>

            <section id="liability" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed italic border-l-4 border-border pl-6">
                "To the fullest extent permitted by law, Coding Notes Platform
                will not be liable for any indirect, incidental, special, or
                consequential damages resulting from your use of the platform or
                reliance on the notes provided."
              </p>
            </section>

            {/* Footer-like Contact Card */}
            <section id="contact" className="scroll-mt-32 pt-8">
              <div className="p-8 rounded-3xl bg-foreground text-background dark:bg-card dark:text-foreground border border-border text-center">
                <Mail className="w-8 h-8 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Legal Questions?</h2>
                <p className="opacity-70 mb-6 text-sm max-w-md mx-auto">
                  If you have concerns about these terms or our intellectual
                  property, please reach out to our legal team.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  Contact Support
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
