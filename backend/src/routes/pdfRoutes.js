import express from "express"
import {
  uploadPDF,
  createPDF,
  updatePDF,
  deletePDF,
  getPDFs,
  getPDFById,
  getPDFUrl,
  getAdminPDFs,
  streamPDF,
  downloadPDF,
} from "../controllers/pdfController.js"
import { protect, adminOnly } from "../middleware/auth.js"
import upload from "../config/multer.js"

const router = express.Router()

// Admin routes - Define before parameterized routes to avoid matching issues
router.get("/admin/all", protect, adminOnly, getAdminPDFs)
router.post("/upload", protect, adminOnly, upload.single("pdf"), uploadPDF)
router.post("/", protect, adminOnly, createPDF)

// User routes - Read only (including specific sub-routes before :id parameter)
router.get("/", getPDFs)
router.get("/:id/url", protect, getPDFUrl)
router.get("/:id/stream", protect, streamPDF)
router.post("/:id/download", protect, downloadPDF)
router.get("/:id", getPDFById)

// Update and Delete
router.put("/:id", protect, adminOnly, updatePDF)
router.delete("/:id", protect, adminOnly, deletePDF)

export default router
