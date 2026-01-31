import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Chrome,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      login(response.token, response.user);
      navigate(response.user.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary/10">
      {/* Left Side - Simplified Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-secondary/30 relative overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--primary)_0%,transparent_70%)] opacity-[0.03]" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              CodeNotes
            </span>
          </Link>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                className="text-5xl font-bold leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-cal-sans)" }}
              >
                Your Second <br />
                <span className="text-primary">Coding Brain.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
                The most efficient way to master the MERN stack and technical
                interviews.
              </p>
            </motion.div>

            {/* Interactive Feature Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-card border border-border shadow-2xl shadow-primary/5 flex gap-4 items-center"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary/80">
                  New Update
                </p>
                <p className="text-sm text-muted-foreground">
                  Interactive React Visualizers are now live.
                </p>
              </div>
            </motion.div>
          </div>

          <p className="text-sm text-muted-foreground/60 font-medium">
            &copy; {new Date().getFullYear()} CodeNotes Inc.
          </p>
        </div>
      </div>

      {/* Right Side - Clean Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              {isLogin ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Log in to your account"
                : "Join the developer community"}
            </p>
          </div>

          {/* Single Google Button */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl bg-background border-border hover:bg-secondary/50 transition-all gap-3"
            onClick={handleGoogleLogin}
            type="button"
          >
            <Chrome className="w-5 h-5" />
            <span className="font-medium text-foreground">
              Continue with Google
            </span>
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">
                Or email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="name"
                    className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-11 h-12 rounded-xl border-border bg-secondary/20 focus:bg-background transition-all"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-11 h-12 rounded-xl border-border bg-secondary/20 focus:bg-background transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Password
                </Label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    size="sm"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl border-border bg-secondary/20 focus:bg-background transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Account"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "New here? " : "Already have an account? "}
              <span className="text-primary font-bold">
                {isLogin ? "Create an account" : "Sign in"}
              </span>
            </button>
          </div>

          <p className="mt-12 text-[11px] text-center text-muted-foreground/60 leading-relaxed uppercase tracking-tighter">
            By joining, you agree to our <br />
            <Link to="/terms" className="underline">
              Terms
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
