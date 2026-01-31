import express from "express"
import { sendContactEmail, sendFeedback } from "../controllers/contactController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// POST /api/contact/send - Send contact form message (requires authentication)
router.post("/send", protect, sendContactEmail)
 
// POST /api/contact/feedback - Send feedback (requires authentication)
router.post("/feedback", protect, sendFeedback) 

export default router 
 