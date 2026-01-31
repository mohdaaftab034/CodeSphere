import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Get current directory in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables FIRST with explicit path
const envPath = path.resolve(__dirname, "../.env")
const result = dotenv.config({ path: envPath })
if (result.error) {
  console.warn(`⚠️  Could not load .env file from ${envPath}:`, result.error.message)
} else {
  console.log(`✅ Loaded .env from ${envPath}`)
}

// NOW import modules that depend on environment variables
import { connectDB } from "./config/database.js"
import authRoutes from "./routes/authRoutes.js"
import noteRoutes from "./routes/noteRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import pdfRoutes from "./routes/pdfRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import chapterRoutes from "./routes/chapterRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"

// Import passport after env is loaded
import passport from "./config/passport.js"
import { initializeInterviewQuestionScheduler } from "./utils/scheduler.js"

const app = express()
const PORT = process.env.PORT || 5001
 
// Middleware
app.use(cors())
app.use(express.json())

// Initialize Passport
app.use(passport.initialize())

// Connect to MongoDB
connectDB()

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/chapters", chapterRoutes)
app.use("/api/interview-questions", interviewRoutes)
app.use("/api/pdfs", pdfRoutes)
app.use("/api/users", userRoutes)
app.use("/api/contact", contactRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Internal server error", error: err.message })
})
 
app.listen(5000, () => {
  console.log(`Server running on port ${PORT}`)
  
  // Initialize schedulers
  initializeInterviewQuestionScheduler("0 9 * * *") // Daily at 9 AM
})
