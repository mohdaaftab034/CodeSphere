import express from "express"
import {
  createNote,
  updateNote,
  deleteNote,
  getNotes,
  getNoteById,
  getNoteBySlug,
  getAllNotes,
  downloadNoteAsPDF, 
} from "../controllers/noteController.js"
import { protect, adminOnly } from "../middleware/auth.js"

const router = express.Router()

// Admin routes - define specific paths before generic :id
router.get("/admin/all", protect, adminOnly, getAllNotes)
router.post("/", protect, adminOnly, createNote)
router.put("/:id", protect, adminOnly, updateNote)
router.delete("/:id", protect, adminOnly, deleteNote)

// User routes - Read only
router.get("/", getNotes)
router.get("/slug/:slug", getNoteBySlug)
router.get("/:id/download-pdf", downloadNoteAsPDF)
router.get("/:id", getNoteById)

export default router
