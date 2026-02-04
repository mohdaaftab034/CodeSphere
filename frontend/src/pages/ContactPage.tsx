import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Copy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { contactAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function ContactPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { user, token } = useAuth()

  useEffect(() => {
    document.title = `Contact Us | ${websiteName}`
  }, [websiteName]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy to clipboard handler
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !user || !token) return;

    setSubmitting(true);
    setError("");

    try {
      await contactAPI.sendMessage({ message: message.trim() }, token);
      setSubmitted(true);
      setMessage("");
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@codingnotes.dev",
      action: () => handleCopy("support@codingnotes.dev", "Email"),
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      action: () => handleCopy("+1 (555) 123-4567", "Phone"),
    },
    {
      icon: MapPin,
      label: "Location",
      value: "San Francisco, CA",
      action: null,
    },
  ];

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/20">
      <Navbar />

      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-blue-500/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="pt-32 pb-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Response time: &lt; 24 hours
            </div>
            <h1
              className="text-4xl sm:text-6xl font-bold text-foreground mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Let's Start a Conversation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have a question about our notes, finding a bug, or just want to
              say hi? We're here to help you ace your interviews.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Column: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="p-8 rounded-3xl bg-card/30 border border-border/50 backdrop-blur-sm shadow-sm">
                <h3 className="text-xl font-semibold mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((item, i) => (
                    <div
                      key={i}
                      onClick={item.action || undefined}
                      className={`group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 border border-transparent ${item.action ? "cursor-pointer hover:bg-secondary/50 hover:border-border/50" : ""}`}
                    >
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          {item.label}
                        </div>
                        <div className="text-foreground font-medium flex items-center justify-between">
                          {item.value}
                          {item.action && (
                            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {copiedField === item.label ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copiedField === item.label ? "Copied" : "Copy"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Teaser Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Check our FAQ
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Most questions about subscriptions and content are
                      answered in our help center.
                    </p>
                    <Link
                      to="/faq"
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Help Center <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="relative h-full">
                <div className="h-full p-8 md:p-10 rounded-3xl bg-card border border-border shadow-2xl shadow-primary/5 flex flex-col relative overflow-hidden">
                  {/* Top Gradient Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50" />

                  <h3 className="text-2xl font-bold mb-2">Send us a message</h3>
                  <p className="text-muted-foreground mb-8">
                    We usually respond within a few hours.
                  </p>

                  {/* Auth Overlay - Shows if user is NOT logged in */}
                  {!user && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md p-6 text-center">
                      <div className="p-4 rounded-full bg-primary/10 mb-4">
                        <AlertCircle className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">
                        Authentication Required
                      </h4>
                      <p className="text-muted-foreground max-w-xs mb-6">
                        Please sign in to send a support message. This helps us
                        track your request better.
                      </p>
                      <div className="flex gap-3">
                        <Button asChild>
                          <Link to="/login">Sign In</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to="/register">Create Account</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex-1 flex flex-col items-center justify-center text-center py-12"
                      >
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h4 className="text-2xl font-bold text-foreground mb-2">
                          Message Sent!
                        </h4>
                        <p className="text-muted-foreground max-w-sm">
                          Thanks for reaching out, {user?.email}. We've received
                          your message and will get back to you shortly.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-8"
                          onClick={() => setSubmitted(false)}
                        >
                          Send another message
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`space-y-6 flex-1 flex flex-col ${!user ? "opacity-20 pointer-events-none" : ""}`} // Visual ghosting if not logged in
                        onSubmit={onSubmit}
                      >
                        {error && (
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2 ml-1">
                            Your Account Email
                          </label>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{user?.email || "example@email.com"}</span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium text-foreground mb-2 ml-1"
                          >
                            How can we help?
                          </label>
                          <textarea
                            id="message"
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            placeholder="Tell us about the issue or question..."
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={submitting || !message.trim()}
                          size="lg"
                          className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/20"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message
                              <Send className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
