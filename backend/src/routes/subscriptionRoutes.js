import express from "express";
import { createOrder, verifyPayment, getStatus } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Routes are protected as subscription is tied to a user account
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/status", protect, getStatus);

export default router;
