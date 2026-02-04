import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Bug,
  Lightbulb,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { contactAPI } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function FeedbackPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { user } = useAuth();

  useEffect(() => {
    document.title = `Feedback | ${websiteName}`
  }, [websiteName])

  const isAuthenticated = !!user;
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const feedbackOptions = [
    { label: "Bug Report", icon: Bug },
    { label: "Feature Request", icon: Lightbulb },
    { label: "General Feedback", icon: MessageCircle },
    { label: "Content Suggestion", icon: BookOpen },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Session expired. Please log in again.");

      await contactAPI.sendFeedback(
        {
          feedbackType,
          subject: subject.trim(),
          details: details.trim(),
        },
        token,
      );

      setSubmitted(true);
      setSubject("");
      setDetails("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] -z-10" />

      <div className="pt-32 pb-24 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h1
              className="text-4xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Share Your Thoughts
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Your feedback shapes the future of {import.meta.env.VITE_WEBSITE_NAME}. Tell us what's
              working and what we can do better.
            </p>
          </motion.div>

          <div className="relative group">
            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative p-1 md:p-8 rounded-[2.5rem] bg-card border border-border shadow-2xl shadow-primary/5 overflow-hidden"
            >
              {/* Inner Form Content */}
              <div className="p-6 md:p-2">
                <AnimatePresence mode="wait">
                  {!isAuthenticated ? (
                    <motion.div
                      key="unauth"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Login Required</h3>
                      <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                        To maintain high-quality feedback, we only accept
                        submissions from registered users.
                      </p>
                      <Button asChild size="lg" className="rounded-full px-8">
                        <Link to="/login">Sign in to Continue</Link>
                      </Button>
                    </motion.div>
                  ) : submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                      <p className="text-muted-foreground mb-6">
                        Your feedback has been logged. Our team reviews every
                        submission.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                        className="rounded-full"
                      >
                        Send more feedback
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={onSubmit}
                      className="space-y-6"
                    >
                      {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-3">
                          <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                      )}

                      {/* Feedback Type Grid */}
                      <div>
                        <label className="text-sm font-semibold text-foreground/70 mb-3 block ml-1 uppercase tracking-wider">
                          What's this about?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {feedbackOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = feedbackType === opt.label;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => setFeedbackType(opt.label)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center ${
                                  isActive
                                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                                    : "bg-background border-border text-muted-foreground hover:border-primary/40"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase">
                                  {opt.label.split(" ")[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            placeholder="Subject line"
                            className="w-full bg-secondary/30 border-none rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>

                        <div className="relative">
                          <textarea
                            rows={5}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            required
                            placeholder="Tell us everything... (steps to reproduce, feature ideas, etc.)"
                            className="w-full bg-secondary/30 border-none rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          submitting || !subject.trim() || !details.trim()
                        }
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            Submit Feedback <Send className="w-4 h-4" />
                          </span>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground italic">
                        Logged in as:{" "}
                        <span className="text-foreground font-medium">
                          {user?.email}
                        </span>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
