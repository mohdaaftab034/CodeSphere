import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../lib/api";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.title = `Login | ${websiteName}`
  }, [websiteName])

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // OTP state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);

      // Check if this is an OTP response (new flow) or direct login (old flow)
      if (response.userId && response.message && response.message.includes("OTP")) {
        // OTP flow - show OTP input
        setUserId(response.userId);
        setShowOtpInput(true);
        setError("");
        setIsLoading(false);
      } else if (response.token && response.user) {
        // Direct login (for backward compatibility or if OTP is disabled)
        const userWithRole = {
          ...response.user,
          role: response.user.role || "user"
        };
        login(response.token, userWithRole);

        // Force a page refresh to ensure token is properly recognized by all components
        if (userWithRole.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !otp) {
      setError("Please enter the OTP code");
      return;
    }

    setError("");
    setIsVerifyingOtp(true);

    try {
      const response = await authAPI.verifyOtp(userId, otp);

      if (response.success && response.token && response.user) {
        // Ensure user has a role
        const userWithRole = {
          ...response.user,
          role: response.user.role || "user"
        };

        login(response.token, userWithRole);

        // Force a page refresh to ensure token is properly recognized by all components
        if (userWithRole.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setIsLoading(true);
    try {
      await authAPI.login(email, password);
      setError("");
      setOtp("");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
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
              {import.meta.env.VITE_WEBSITE_NAME}
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
            &copy; {new Date().getFullYear()} {import.meta.env.VITE_WEBSITE_NAME} Inc.
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
            className="w-full h-12 rounded-xl bg-white border-[#747775] hover:bg-[#F2F2F2] transition-all gap-3 shadow-md border-opacity-20"
            onClick={handleGoogleLogin}
            type="button"
          >
            <GoogleIcon />
            <span className="font-semibold text-[#1f1f1f]">
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

          {/* OTP Input Form */}
          {showOtpInput ? (
            <form onSubmit={handleOtpVerification} className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Enter Verification Code</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  OTP Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="h-12 rounded-xl border-border bg-secondary/20 focus:bg-background transition-all text-center text-2xl font-bold tracking-widest"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
                disabled={isVerifyingOtp || otp.length !== 6}
              >
                {isVerifyingOtp ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Verify OTP <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp("");
                    setUserId(null);
                    setError("");
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            </form>
          ) : (
            /* Regular Login Form */
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
          )}

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
