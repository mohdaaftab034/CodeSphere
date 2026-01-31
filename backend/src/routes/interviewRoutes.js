import express from "express"
import {
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
  getQuestionsByRole, 
  getAllQuestions,
  getQuestionById,
  getAdminQuestions,
  generateRolePDF,
  triggerDailyQuestion,
} from "../controllers/interviewController.js"
import { protect, adminOnly } from "../middleware/auth.js"

const router = express.Router()

// Admin routes - MUST come BEFORE generic GET routes to avoid conflicts
router.post("/", protect, adminOnly, createInterviewQuestion)
router.put("/:id", protect, adminOnly, updateInterviewQuestion)
router.delete("/:id", protect, adminOnly, deleteInterviewQuestion)
router.get("/admin/all", protect, adminOnly, getAdminQuestions)
router.post("/admin/trigger-daily", protect, adminOnly, triggerDailyQuestion)

// User routes - Read only (AFTER admin routes to avoid conflicts)
router.get("/pdf/:role", generateRolePDF)
router.get("/", getQuestionsByRole)
router.get("/all", getAllQuestions)
router.get("/:id", getQuestionById)

export default router
