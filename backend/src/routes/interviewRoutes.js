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
  getQuestionsByType,
  generateFilteredPDF,
  getInterviewMeta,
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
router.get("/meta", getInterviewMeta)
router.get("/pdf/:type/:slug", protect, generateFilteredPDF)
router.get("/pdf/:role", protect, generateRolePDF)
router.get("/topic/:slug", getQuestionsByType)
router.get("/company/:slug", getQuestionsByType)
router.get("/role/:slug", getQuestionsByType)
router.get("/difficulty/:slug", getQuestionsByType)
router.get("/", getQuestionsByRole)
router.get("/all", getAllQuestions)
router.get("/:id", getQuestionById)

export default router
