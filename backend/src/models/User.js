import mongoose from "mongoose"

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
      required: function () {
        // Password is only required if not using OAuth
        return !this.googleId
      },
      minlength: 6,
      select: false, // Don't return password by default
    },
    // OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    avatar: {
      type: String, // Store profile picture URL
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    savedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    }],
    savedPDFs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "HandwrittenPDF",
    }],
    savedRoadmaps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
    },
  },
  { timestamps: true }
)

export default mongoose.model("User", userSchema)
