import mongoose from "mongoose"
import dotenv from "dotenv"
import Chapter from "../src/models/Chapter.js"

dotenv.config()

const sampleChapters = [
  {
    title: "Basics",
    slug: "basics",
    description: "Fundamental concepts and getting started",
    icon: "BookOpen",
    gradient: "from-blue-500/80 to-indigo-500/80",
  },
  {
    title: "Advanced Topics",
    slug: "advanced-topics",
    description: "Deep dive into advanced concepts",
    icon: "Code2",
    gradient: "from-purple-500/80 to-pink-500/80",
  },
  {
    title: "Best Practices",
    slug: "best-practices",
    description: "Industry standards and recommended patterns",
    icon: "Briefcase",
    gradient: "from-emerald-500/80 to-teal-500/80",
  },
  {
    title: "Projects",
    slug: "projects",
    description: "Hands-on projects and real-world applications",
    icon: "Layers",
    gradient: "from-orange-500/80 to-amber-500/80",
  },
]

async function seedChapters() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Clear existing chapters
    const deleteCount = await Chapter.countDocuments()
    if (deleteCount > 0) {
      await Chapter.deleteMany({})
      console.log(`Cleared ${deleteCount} existing chapters`)
    }

    // Insert sample chapters
    const chapters = await Chapter.insertMany(sampleChapters)
    console.log(`✅ Seeded ${chapters.length} chapters successfully:`)
    chapters.forEach((ch) => {
      console.log(`  - ${ch.title} (${ch.slug})`)
    })

    process.exit(0)
  } catch (error) {
    console.error("Error seeding chapters:", error)
    process.exit(1)
  }
}

seedChapters()
