import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error)
  } else if (success) {
    console.log("Email transporter configured successfully")
  }
})

export default transporter
