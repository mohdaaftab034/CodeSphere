import mongoose from "mongoose"
import dotenv from "dotenv"
import Note from "../src/models/Note.js"

dotenv.config()

const sampleNote = {
  title: "Introduction to JavaScript",
  slug: "introduction-to-javascript",
  category: "JavaScript",
  chapter: "Basics",
  difficulty: "Beginner",
  excerpt: "Learn the fundamentals of JavaScript programming language",
  author: "Admin",
  readingTime: "5 min",
  blocks: [
    {
      id: "block-1",
      type: "text",
      content: "JavaScript is a versatile programming language that powers the web. In this guide, we'll explore the fundamentals of JavaScript and how to get started.",
    },
    {
      id: "block-2",
      type: "code",
      language: "javascript",
      content: `console.log("Hello, World!");
const greeting = "Welcome to JavaScript";
console.log(greeting);`,
    },
    {
      id: "block-3",
      type: "tip",
      content: "JavaScript is case-sensitive, so 'variable' and 'Variable' are different identifiers.",
    },
  ],
  isPremium: false,
  status: "Published",
}

async function seedNote() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Check if note already exists
    const existing = await Note.findOne({ slug: sampleNote.slug })
    if (existing) {
      console.log("Sample note already exists, updating it...")
      await Note.findByIdAndUpdate(existing._id, sampleNote)
      console.log("✅ Note updated successfully")
    } else {
      await Note.create(sampleNote)
      console.log("✅ Sample note created successfully")
    }

    process.exit(0)
  } catch (error) {
    console.error("Error seeding note:", error)
    process.exit(1)
  }
}

seedNote()
