import User from "../models/User.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/helpers.js"
import { validateLogin } from "../middleware/validation.js"
import { sendNotificationToUsers } from "../utils/notificationService.js"

export const login = async (req, res) => {
  try {
    const { error, value } = validateLogin(req.body) 
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { email, password } = value

    // Check if user exists
    let user = await User.findOne({ email }).select("+password")

    let isNewUser = false;
    if (!user) {
      // Create regular user if doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10)
      user = await User.create({
        name: email.split("@")[0],
        email,
        password: hashedPassword,
        role: "user",
        authProvider: "local",
      })
      isNewUser = true;
    } else {
      // Check if user is OAuth user
      if (user.authProvider === "google" && !user.password) {
        return res.status(400).json({ 
          message: "This account uses Google sign-in. Please sign in with Google." 
        })
      }

      // Verify password
      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid email or password" })
      }
    }

    // Generate token
    const token = generateToken(user._id)

    // Send welcome or login email
    try {
      const subject = isNewUser
        ? "Welcome to Coding Notes Platform!"
        : "Login Notification - Coding Notes Platform";
      const htmlContent = isNewUser
        ? `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #667eea;'>Welcome, ${user.name || user.email}!</h2>
            <p>Thank you for signing up for Coding Notes Platform. We're excited to have you on board!</p>
            <p>Start exploring notes, chapters, and more at <a href='https://codenotes.dev'>codenotes.dev</a>.</p>
            <p style='color: #999; font-size: 12px;'>If you did not sign up, please ignore this email.</p>
          </div>`
        : `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #667eea;'>Login Successful</h2>
            <p>Hello, ${user.name || user.email}!</p>
            <p>You have successfully logged in to Coding Notes Platform.</p>
            <p>If this wasn't you, please reset your password immediately.</p>
            <p style='color: #999; font-size: 12px;'>This is an automated notification.</p>
          </div>`;
      await sendNotificationToUsers(subject, htmlContent, [user.email]);
    } catch (e) {
      console.error("Failed to send login/signup email notification:", e.message);
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Google OAuth callback handler
export const googleCallback = async (req, res) => {
  try {
    // User is authenticated via passport
    const user = req.user

    // Generate JWT token
    const token = generateToken(user._id)

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173"
    res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authProvider: user.authProvider,
    }))}`)
  } catch (error) {
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173"
    res.redirect(`${frontendURL}/login?error=${encodeURIComponent(error.message)}`)
  }
}
