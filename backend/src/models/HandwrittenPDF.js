import mongoose from "mongoose"

const handwrittenPDFSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["JavaScript", "React", "MERN", "DSA", "System Design"],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF URL is required"],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    imageKitFileId: {
      type: String,
      default: null,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    totalPages: {
      type: Number,
      default: 1, 
    },
    tags: [String],
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

// Index for filtering
handwrittenPDFSchema.index({ category: 1, level: 1 })

export default mongoose.model("HandwrittenPDF", handwrittenPDFSchema)
