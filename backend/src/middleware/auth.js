import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1]

    if (!token) {
      console.log("❌ [Auth] No token found in Authorization header")
      return res.status(401).json({ message: "Not authenticated" })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (!user) {
        console.log(`❌ [Auth] User not found for ID: ${decoded.id}`)
        return res.status(404).json({ message: "User not found" })
      }

      req.user = user
      next()
    } catch (jwtError) {
      console.log(`❌ [Auth] JWT verification failed: ${jwtError.message}`)
      console.log(`   Expected Secret: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`)
      res.status(401).json({ message: "Invalid token" })
    }
  } catch (error) {
    console.error("❌ [Auth] Middleware error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
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
