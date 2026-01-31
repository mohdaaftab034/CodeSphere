import express from "express"
import { protect, adminOnly } from "../middleware/auth.js"
import { createChapter, getChapters, getChapterBySlug, updateChapter, deleteChapter } from "../controllers/chapterController.js"

const router = express.Router()

// Public
router.get("/", getChapters)
router.get("/slug/:slug", getChapterBySlug)

// Admin 
router.post("/", protect, adminOnly, createChapter)
router.put("/:id", protect, adminOnly, updateChapter)
router.delete("/:id", protect, adminOnly, deleteChapter)

export default router
