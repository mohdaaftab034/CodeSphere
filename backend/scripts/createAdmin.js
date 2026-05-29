import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") })

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Check if admin already exists (try both emails)
    let existingAdmin = await User.findOne({ email: "mohdaaftab8630@gmail.com" })
    
    if (!existingAdmin) {
      existingAdmin = await User.findOne({ email: "admin@example.com" })
    }
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists with email:", existingAdmin.email)
      
      // Update to admin role if not already
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin"
        await existingAdmin.save()
        console.log("User role updated to admin")
      }
      
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Aaftab@123", 10)

    // Create admin user with both emails available
    const admin = await User.create({
      name: "Mohd Aaftab",
      email: "mohdaaftab8630@gmail.com",
      password: hashedPassword,
      role: "admin",
    })

    console.log("Admin user created successfully!")
    console.log("Email:", admin.email)
    console.log("Password: Aaftab@123")
    console.log("Role:", admin.role)
    
    // Also create admin@example.com if it doesn't exist
    try {
      const altAdmin = await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      })
      console.log("Alternative admin account created: admin@example.com")
    } catch (altError) {
      if (altError.code === 11000) {
        // Email already exists, update it to admin
        const existing = await User.findOne({ email: "admin@example.com" })
        existing.role = "admin"
        await existing.save()
        console.log("Existing admin@example.com account upgraded to admin role")
      }
    }

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error.message)
    process.exit(1)
  }
}

createAdmin()
