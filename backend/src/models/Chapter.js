import mongoose from "mongoose"

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "Chapter slug is required"],
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    icon: {
      type: String,
      default: "BookOpen",
    },
    gradient: {
      type: String,
      default: "from-gray-500/80 to-gray-600/80",
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

chapterSchema.index({ slug: 1 })
chapterSchema.index({ title: 1 })

export default mongoose.model("Chapter", chapterSchema)
