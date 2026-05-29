import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Get current directory in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables FIRST with explicit path before any other imports
const envPath = path.resolve(__dirname, "../.env")
const result = dotenv.config({ path: envPath })
if (result.error) {
  console.warn(`Could not load .env file from ${envPath}:`, result.error.message)
} else {
  console.log(`Loaded .env from ${envPath}`)
}

import express from "express"
import cors from "cors"

// NOW import modules that depend on environment variables
import { connectDB } from "./config/database.js"
import authRoutes from "./routes/authRoutes.js"
import noteRoutes from "./routes/noteRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import pdfRoutes from "./routes/pdfRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import chapterRoutes from "./routes/chapterRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import roadmapRoutes from "./routes/roadmapRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"

// Import passport after env is loaded
import passport from "./config/passport.js"
import { initializeInterviewQuestionScheduler } from "./utils/scheduler.js"

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

// Initialize Passport
app.use(passport.initialize())

// Connect to MongoDB
connectDB()

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "CodeSphere API is online",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      notes: "/api/notes"
    }
  })
})

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/chapters", chapterRoutes)
app.use("/api/interview-questions", interviewRoutes)
app.use("/api/pdfs", pdfRoutes)
app.use("/api/users", userRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/roadmaps", roadmapRoutes)
app.use("/api/ai", aiRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Internal server error", error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  // Initialize schedulers
  initializeInterviewQuestionScheduler("0 9 * * *") // Daily at 9 AM
})

export default app

