import mongoose from "mongoose"

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [false, "Category is required"],
      // Accept any string; validation is handled in middleware for dynamic categories
    },
    chapter: {
      type: String,
      required: [true, "Chapter is required"],
    },
    chapterId: {
      type: String,
      // Chapter ID from JSON config for routing
    },
    content: {
      type: String,
      required: [true, "Content (markdown) is required"],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    author: {
      type: String,
      default: "Admin",
    },
    readingTime: {
      type: String,
      default: "5 min",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    views: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Create index for search and filtering
noteSchema.index({ category: 1, chapter: 1 })
noteSchema.index({ slug: 1 })

export default mongoose.model("Note", noteSchema)

