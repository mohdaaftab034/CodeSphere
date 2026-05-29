import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Send,
  Sparkles,
  Loader2,
  MessageSquare,
  AlertCircle,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { aiAPI } from "../lib/api";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Link } from "react-router-dom";

interface AIChatProps {
  noteTitle: string;
  noteContent: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const FREE_AI_MESSAGE_LIMIT = 10

export function AIChat({ noteTitle, noteContent }: AIChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isPaid, token, user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [aiMessagesUsed, setAiMessagesUsed] = useState(user?.aiMessagesUsed || 0);

  useEffect(() => {
    setAiMessagesUsed(user?.aiMessagesUsed || 0);
  }, [user?.aiMessagesUsed]);

  const freeMessagesRemaining = isPaid ? null : Math.max(FREE_AI_MESSAGE_LIMIT - aiMessagesUsed, 0);
  const hasFreeAccessRemaining = isPaid || (freeMessagesRemaining ?? 0) > 0;

  // Automatic scroll to bottom removed per user request to maintain reading position

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading || !token) return;

    if (!hasFreeAccessRemaining) {
      setError("You have used all 10 free AI messages. Subscribe to continue.");
      setShowSubscribeModal(true);
      return;
    }

    const userMessage = question.trim();
    setQuestion("");
    setError(null);

    // Add unique ID for framer-motion keys
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMessage },
    ]);
    setIsLoading(true);

    try {
      const response = await aiAPI.askDoubt(token, {
        noteTitle,
        noteContent,
        question: userMessage,
      });

      if (response.success) {
        if (response.usage?.aiMessagesUsed !== undefined && response.usage?.aiMessagesUsed !== null) {
          setAiMessagesUsed(response.usage.aiMessagesUsed);
        } else if (!isPaid) {
          setAiMessagesUsed((currentValue) => currentValue + 1);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: response.answer,
          },
        ]);
      } else {
        throw new Error(response.message || "Failed to get answer");
      }
    } catch (err) {
      const errorWithMeta = err as Error & { status?: number; code?: string; remainingFreeMessages?: number };
      if (errorWithMeta.status === 403 && errorWithMeta.code === "SUBSCRIPTION_REQUIRED") {
        setError(errorWithMeta.message);
        setShowSubscribeModal(true);
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-primary/10">
      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubscribeModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubscribeModal(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

              <div className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold mb-3">Unlock CodeSphere Pro</h3>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                  Get unlimited access to our AI Doubt Solver, professional roadmap guides,
                  premium handwritten notes, and ad-free learning experience.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Unlimited AI Questions",
                    "Step-by-step Code Breakdowns",
                    "Downloadable Premium PDFs",
                    "Early Access to New Features"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-left bg-secondary/30 p-3 rounded-xl border border-border/50">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Zap className="w-3.3 h-3.3 fill-emerald-500" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowSubscribeModal(false)}
                    className="rounded-2xl"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    asChild
                    className="rounded-2xl font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <Link to="/subscribe">Subscribe Now</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header with Gradient Text */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              AI Doubt Solver
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              Context:{" "}
              <span className="font-medium text-primary/80">{noteTitle}</span>
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {!isPaid && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between gap-4 rounded-3xl border p-5 ${hasFreeAccessRemaining ? "border-primary/15 bg-primary/5" : "border-amber-300/40 bg-amber-500/10"}`}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {hasFreeAccessRemaining ? `${freeMessagesRemaining} free AI message${freeMessagesRemaining === 1 ? "" : "s"} left` : "Free AI quota reached"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasFreeAccessRemaining
                  ? "You can continue asking questions until you hit the 10-message limit."
                  : "Subscribe to keep using the AI Doubt Solver."}
              </p>
            </div>
            <Button onClick={() => setShowSubscribeModal(true)} className="rounded-full px-5 font-semibold" size="sm">
              Subscribe
            </Button>
          </motion.div>
        )}

        {/* Chat Area */}
        <div className="min-h-[100px] space-y-6">
          <LayoutGroup>
            <AnimatePresence mode="popLayout" initial={false}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 border rounded-3xl border-dashed bg-secondary/5"
                >
                  <MessageSquare className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-muted-foreground italic">
                    No questions yet. Try asking "Explain the core concepts of {noteTitle}"
                  </p>
                </motion.div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-primary"
                      }`}
                  >
                    {msg.role === "user" ? (
                      <MessageSquare className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-5 shadow-sm transition-all ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border rounded-tl-none"
                      }`}
                  >
                    {msg.role === "user" ? (
                      <p className="leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 items-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
              <div className="px-5 py-3 bg-secondary/40 rounded-2xl text-sm font-medium animate-pulse text-primary">
                Analyzing notes and drafting response...
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              layout
              className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-destructive text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Modern Glassmorphic Input */}
        <div className="sticky bottom-6">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 p-2 rounded-[24px] bg-background/80 backdrop-blur-xl border border-primary/10 shadow-2xl focus-within:border-primary/30 transition-all"
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={hasFreeAccessRemaining ? "Ask a follow-up question..." : "Subscribe to ask more questions..."}
              disabled={!hasFreeAccessRemaining || isLoading}
              className="w-full outline-none bg-transparent border-none focus:ring-0 p-4 min-h-[56px] max-h-[200px] text-foreground resize-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Button
              type="submit"
              disabled={!question.trim() || isLoading || !hasFreeAccessRemaining}
              size="icon"
              className="mb-2 mr-2 w-12 h-12 rounded-2xl shrink-0 shadow-lg transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="mt-3 text-[11px] text-center text-muted-foreground/60">
            Powered by Groq • AI may produce inaccurate results.
          </p>
        </div>
      </div>
    </section>
  );
}
