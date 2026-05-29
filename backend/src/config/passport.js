import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/User.js"

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id)
})

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Google OAuth Strategy - always configure, will error if credentials missing
try {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id })

            if (user) {
              // User exists, return the user
              return done(null, user)
            }

            // Check if user exists with the same email
            user = await User.findOne({ email: profile.emails[0].value })

            if (user) {
              // User exists with this email but no Google ID - link accounts
              user.googleId = profile.id
              user.authProvider = "google"
              user.avatar = profile.photos?.[0]?.value || user.avatar
              await user.save()
              return done(null, user)
            }

            // Create new user
            const newUser = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              authProvider: "google",
              role: "user",
            })

            return done(null, newUser)
          } catch (error) {
            return done(error, null)
          }
        }
      )
    )
    console.log("Google OAuth strategy configured successfully")
  } else {
    console.log("Google OAuth credentials not found in environment variables")
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET")
    console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET")
  }
} catch (error) {
  console.error("❌ Error configuring Google OAuth:", error.message)
}

export default passport
