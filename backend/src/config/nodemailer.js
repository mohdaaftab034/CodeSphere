import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // or use another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error.message)
  } else {
    console.log("Email service ready")
  }
})

export default transporter
