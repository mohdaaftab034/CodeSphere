import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    let token = authHeader?.split(" ")[1]

    if (!token) {
      console.log("❌ [Auth] No token found in Authorization header")
      return res.status(401).json({ message: "Not authenticated" })
    }

    // Trim token to handle potential whitespace or quotes
    token = token.trim().replace(/^["'](.+)["']$/, '$1')

    let decoded
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables")
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      console.log(`❌ [Auth] JWT verification failed for user: ${jwtError.message}`)
      return res.status(401).json({ message: `Invalid token: ${jwtError.message}` })
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      console.log(`❌ [Auth] User not found for ID: ${decoded.id}`)
      return res.status(404).json({ message: "User not found" })
    }

    // Check if subscription has expired
    if (user.isPaid && user.subscriptionExpiresAt && new Date() > new Date(user.subscriptionExpiresAt)) {
      console.log(`⏰ [Auth] Subscription expired for user ${user.email}`)
      user.isPaid = false
      user.subscriptionExpiresAt = null
      await user.save()
    }

    req.user = user
    next()
  } catch (error) {
    console.error("❌ [Auth] Middleware error:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
}

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

export const paidOnly = (req, res, next) => {
  if (!req.user || !req.user.isPaid) {
    return res.status(403).json({ message: "Subscription required to access this feature" })
  }
  next()
}

export const optional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = { id: decoded.id }
    }
  } catch (error) {
    // Continue without authentication
  }

  next()
}
