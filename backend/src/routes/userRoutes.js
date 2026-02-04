import express from "express"
import {
  getAllUsers,
  getDashboardStats,
  updateUser,
  deleteUser,
  saveNote,
  unsaveNote,
  savePDF,
  unsavePDF,
  saveRoadmap,
  unsaveRoadmap,
  getUserDashboard,
  checkSavedItems,
  updateUserProfile,
  uploadAvatar
} from "../controllers/userController.js"
import { protect, adminOnly } from "../middleware/auth.js"
import upload from "../config/multer.js"

const router = express.Router()

// Protected user routes
router.get("/dashboard", protect, getUserDashboard)
router.post("/save-note/:noteId", protect, saveNote)
router.delete("/save-note/:noteId", protect, unsaveNote)
router.post("/save-pdf/:pdfId", protect, savePDF)
router.delete("/save-pdf/:pdfId", protect, unsavePDF)
router.post("/save-roadmap/:roadmapId", protect, saveRoadmap)
router.delete("/save-roadmap/:roadmapId", protect, unsaveRoadmap)
router.post("/check-saved", protect, checkSavedItems)
router.put("/profile", protect, updateUserProfile)
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar)

// Protected routes (Admin only)
router.get("/admin/all", protect, adminOnly, getAllUsers)
router.get("/admin/stats", protect, adminOnly, getDashboardStats)
router.put("/admin/:id", protect, adminOnly, updateUser)
router.delete("/admin/:id", protect, adminOnly, deleteUser)

export default router
