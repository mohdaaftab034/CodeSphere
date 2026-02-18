import express from "express"
import { askDoubt } from "../controllers/aiController.js"
import { protect, paidOnly } from "../middleware/auth.js"

const router = express.Router()

router.post("/ask", protect, paidOnly, askDoubt)

export default router
