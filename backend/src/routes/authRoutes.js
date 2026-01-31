import express from "express"
import { login, getProfile, googleCallback } from "../controllers/authController.js"
import { protect } from "../middleware/auth.js"
import passport from "passport"

const router = express.Router()

// Traditional login
router.post("/login", login)
 
// Get user profile
router.get("/profile", protect, getProfile)

// Google OAuth routes - always register, passport handles if strategy exists
router.get(
  "/google",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({ message: "Google OAuth is not configured" })
    }
    next()
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false 
  })
)

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({ message: "Google OAuth is not configured" })
    }
    next()
  },
  passport.authenticate("google", { 
    session: false,
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=oauth_failed` : "http://localhost:5173/login?error=oauth_failed"
  }),
  googleCallback
)
 
export default router
