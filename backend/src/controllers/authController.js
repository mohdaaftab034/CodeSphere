// OTP verification endpoint
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and otp are required" });
    }

    const user = await User.findById(userId).select("+otp +otpExpiry");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please login again." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    // Check if this is a new user (created within the last 2 minutes)
    let isNewUser = false;
    if (user.createdAt) {
      const userCreatedAt = new Date(user.createdAt);
      const now = new Date();
      const timeDiff = (now - userCreatedAt) / 1000; // difference in seconds
      isNewUser = timeDiff < 120; // Consider user new if created within last 2 minutes
    }

    // OTP is valid, clear it and issue token
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Send welcome email for new users or login notification for existing users
    try {
      await sendWelcomeEmail(
        {
          name: user.name || user.email.split("@")[0],
          email: user.email,
        },
        isNewUser
      );
    } catch (emailError) {
      // Don't fail the OTP verification if email fails, just log the error
      console.error("Failed to send welcome/login email:", emailError.message);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user", // Ensure role is always set, default to "user"
        avatar: user.avatar,
        authProvider: user.authProvider || "local",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/helpers.js"
import { validateLogin } from "../middleware/validation.js"
import { sendWelcomeEmail, sendOtpEmail } from "../utils/notificationService.js"

// Helper to generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Generate OTP and expiry
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      userId: user._id,
      email: user.email,
      isNewUser,
    });
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
    // Fetch user fresh from database to ensure we have accurate createdAt timestamp
    const user = await User.findById(req.user._id)

    if (!user) {
      throw new Error("User not found")
    }

    // Determine if this is a new user by checking createdAt timestamp
    // A more reliable approach: check if user was created very recently (within 2 minutes)
    // This accounts for any delays in the OAuth flow
    let isNewUser = false
    if (user.createdAt) {
      const userCreatedAt = new Date(user.createdAt)
      const now = new Date()
      const timeDiff = (now - userCreatedAt) / 1000 // difference in seconds
      // Consider user new if created within last 2 minutes (120 seconds)
      // This is generous enough to account for OAuth flow delays
      isNewUser = timeDiff < 120
      
      console.log(`[Google OAuth] User ${user.email} - Created: ${userCreatedAt.toISOString()}, Time diff: ${timeDiff.toFixed(2)}s, IsNew: ${isNewUser}`)
    } else {
      // If createdAt is missing, assume it's a new user (shouldn't happen, but safety check)
      console.warn(`[Google OAuth] User ${user.email} missing createdAt field, treating as new user`)
      isNewUser = true
    }

    // ALWAYS send welcome email for new users or login notification for existing users
    // This ensures users always receive an email notification when they sign up or log in
    // We send this asynchronously so it doesn't block the OAuth redirect
    try {
      console.log(`[Google OAuth] Preparing to send ${isNewUser ? 'welcome' : 'login'} email to ${user.email}`)
      
      // Validate user has required fields
      if (!user.email) {
        console.error(`❌ [Google OAuth] Cannot send email: user email is missing`)
      } else {
        const emailResult = await sendWelcomeEmail(
          {
            name: user.name || user.email.split("@")[0],
            email: user.email,
          },
          isNewUser
        )
        
        if (emailResult.success) {
          console.log(`✅ [Google OAuth] ${isNewUser ? 'Welcome' : 'Login'} email sent successfully to ${user.email}`)
        } else {
          console.error(`❌ [Google OAuth] Failed to send email to ${user.email}:`, emailResult.error)
          if (emailResult.code) {
            console.error(`   Error code: ${emailResult.code}`)
          }
        }
      }
    } catch (emailError) {
      // Don't fail the OAuth flow if email fails, but log the error for debugging
      console.error(`❌ [Google OAuth] Exception sending ${isNewUser ? 'welcome' : 'login'} email to ${user.email}:`, emailError.message)
      console.error("Email error stack:", emailError.stack)
    }

    // Generate JWT token
    const token = generateToken(user._id)

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173"
    res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user", // Ensure role is always set, default to "user"
      avatar: user.avatar,
      authProvider: user.authProvider || "google",
    }))}`)
  } catch (error) {
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173"
    res.redirect(`${frontendURL}/login?error=${encodeURIComponent(error.message)}`)
  }
}
