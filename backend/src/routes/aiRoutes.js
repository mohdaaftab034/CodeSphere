import express from "express"
import { askDoubt } from "../controllers/aiController.js"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { protect } from "../middleware/auth.js"

const router = express.Router()

const aiAskLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			message: "Too many AI requests. Please wait a few minutes and try again.",
		})
	},
})

router.post("/ask", protect, aiAskLimiter, askDoubt)

export default router
