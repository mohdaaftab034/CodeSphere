import mongoose from "mongoose"

const codeBlockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: ["javascript", "typescript", "python", "bash", "sql", "html", "css"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
  },
  { _id: false }
)

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    content: {
      type: String,
      // New field: unified content with text and code blocks
      // Uses markdown-like syntax: text and ```language code ``` blocks
    },
    difficulty: {
      type: String,
      trim: true,
      default: "Medium",
    },
    subject: {
      type: String,
      trim: true,
      // Optional field for backward compatibility
    },
    roles: [
      {
        type: String,
        trim: true,
        // Removed enum to allow custom role names
      },
    ],
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    companies: [
      {
        type: String,
        trim: true,
      },
    ],
    codeBlocks: [codeBlockSchema],
    isPublished: {
      type: Boolean,
      default: true,
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

// Index for role-based filtering
interviewQuestionSchema.index({ roles: 1 })
interviewQuestionSchema.index({ difficulty: 1 })
interviewQuestionSchema.index({ subject: 1 })
interviewQuestionSchema.index({ topics: 1 })
interviewQuestionSchema.index({ companies: 1 })

export default mongoose.model("InterviewQuestion", interviewQuestionSchema)
 