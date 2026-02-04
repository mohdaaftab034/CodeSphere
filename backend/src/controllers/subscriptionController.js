import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

// Initialize Razorpay
// Note: These should be in your .env file
// RAZORPAY_KEY_ID=your_key_id
// RAZORPAY_KEY_SECRET=your_key_secret
const getRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("placeholder") || keySecret.includes("placeholder")) {
        throw new Error("Razorpay credentials missing or invalid. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.");
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

// @desc    Create Razorpay Order
// @route   POST /api/subscription/create-order
// @access  Private
export const createOrder = async (req, res) => {
    console.log(`📦 [Subscription] Create order request received for user: ${req.user?.email}`);

    // Diagnostic logging for keys
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    console.log(`   RAZORPAY_KEY_ID present: ${!!keyId} ${keyId ? `(${keyId.substring(0, 8)}...)` : ''}`);
    console.log(`   RAZORPAY_KEY_SECRET present: ${!!keySecret}`);

    try {
        const { planType } = req.body;
        console.log(`   Plan Type: ${planType}`);

        let amount = 29900; // Default Monthly: 299 INR
        if (planType === "yearly") {
            amount = 189900; // Yearly: 1899 INR
        }

        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${req.user.id.substring(0, 10)}_${Date.now()}`,
        };

        const razorpay = getRazorpayClient();
        console.log("   Attempting to create order with Razorpay...");
        const order = await razorpay.orders.create(options);

        if (!order) {
            console.error("❌ [Subscription] Razorpay returned empty order object");
            return res.status(500).json({ message: "Failed to create Razorpay order" });
        }

        console.log(`✅ [Subscription] Order created: ${order.id}`);

        // Save order ID to user for verification later if needed
        await User.findByIdAndUpdate(req.user.id, { razorpayOrderId: order.id });

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("❌ [Subscription] Create order error:", error);

        // Return more specific error if available
        const status = error.statusCode || 500;
        const message = error.error?.description || error.message || "Failed to initiate payment";

        res.status(status).json({
            success: false,
            message,
            code: error.error?.code,
            description: error.error?.description
        });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/subscription/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret || keySecret.includes("placeholder")) {
            return res.status(500).json({ message: "Razorpay credentials missing or invalid" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body.toString())
            .digest("hex");

        const isMatch = expectedSignature === razorpay_signature;

        if (isMatch) {
            // Payment is verified
            await User.findByIdAndUpdate(req.user.id, {
                isPaid: true,
                razorpayOrderId: razorpay_order_id,
            });

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid signature, payment verification failed",
            });
        }
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Subscription Status
// @route   GET /api/subscription/status
// @access  Private
export const getStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("isPaid");
        res.status(200).json({
            success: true,
            isPaid: user.isPaid,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
