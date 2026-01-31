import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Globe, UserCheck, Mail, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const sections = [
    { id: "intro", title: "Introduction", icon: <Info className="w-4 h-4" /> },
    {
      id: "collect",
      title: "Information We Collect",
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: "usage",
      title: "How We Use Data",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: "security",
      title: "Data Security",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      id: "rights",
      title: "Your Rights",
      icon: <UserCheck className="w-4 h-4" />,
    },
    { id: "contact", title: "Contact Us", icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-background selection:bg-primary/10">
      <Navbar />

      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-muted-foreground font-medium">
            Simplified for transparency. Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4 ml-3">
                Contents
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

          {/* Policy Content */}
          <div className="flex-1 space-y-16">
            <section id="intro" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Info className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Introduction</h2>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>
                  Your privacy matters to us. This Privacy Policy explains what
                  information <strong>Coding Notes Platform</strong>
                  ("we", "us", or "our") collects, how we use it, and your
                  choices. By using our services, you agree to the practices
                  described here. We built this platform to help developers, not
                  to harvest data.
                </p>
              </div>
            </section>

            <section
              id="collect"
              className="scroll-mt-32 p-8 rounded-3xl bg-card border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 text-primary">
                <Eye className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Information We Collect</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Account",
                    desc: "Name, email, and password used for authentication.",
                  },
                  {
                    title: "Usage",
                    desc: "Pages viewed and interactions to improve the UI.",
                  },
                  {
                    title: "Technical",
                    desc: "IP address and browser type for security audits.",
                  },
                  {
                    title: "Cookies",
                    desc: "Small files to keep you logged in safely.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/50"
                  >
                    <h4 className="font-bold text-foreground mb-1 text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="usage" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Globe className="w-5 h-5" />
                <h2 className="text-2xl font-bold">
                  How We Use Your Information
                </h2>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    Provide and maintain the service, including personalized
                    features and saved content.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    Improve performance and reliability based on aggregate
                    insights.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    Communicate updates, security alerts, and service-related
                    messages.
                  </span>
                </li>
              </ul>
            </section>

            <section
              id="security"
              className="scroll-mt-32 p-8 rounded-3xl bg-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Lock className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We apply administrative, technical, and physical safeguards to
                protect personal data. We use{" "}
                <strong>industry-standard encryption (SSL/TLS)</strong> for all
                data in transit. Despite our efforts, no method of transmission
                or storage is 100% secure; we continuously improve our measures.
              </p>
            </section>

            <section id="rights" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-2xl font-bold">User Rights</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                You have total control over your data. Depending on your
                location (GDPR/CCPA), you may:
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Access Data",
                  "Correct Errors",
                  "Delete Account",
                  "Export PDF",
                ].map((right) => (
                  <span
                    key={right}
                    className="px-4 py-2 rounded-full bg-card border border-border text-xs font-semibold"
                  >
                    {right}
                  </span>
                ))}
              </div>
            </section>

            <section id="contact" className="scroll-mt-32">
              <div className="p-8 rounded-3xl bg-secondary/50 border border-border text-center">
                <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Our privacy team is here to help you understand your data.
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
