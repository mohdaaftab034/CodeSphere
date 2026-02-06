import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import Chapter from "../src/models/Chapter.js"
import { connectDB } from "../src/config/database.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env") })

const importData = async () => {
  try {
    await connectDB()

    const chaptersPath = path.join(__dirname, "../../frontend/public/chapters.json")
    if (!fs.existsSync(chaptersPath)) {
      console.error("❌ chapters.json not found")
      process.exit(1)
    }

    const jsonData = JSON.parse(fs.readFileSync(chaptersPath, "utf-8"))

    console.log(`Processing ${jsonData.length} chapters...`)

    const operations = jsonData.map(c => ({
      updateOne: {
        filter: { title: c.name },
        update: {
          $set: {
            title: c.name,
            slug: c.id,
            description: c.description,
            icon: c.icon,
            gradient: c.gradient,
            level: c.level,
            parentId: c.parentId || null,
            hasSubChapters: c.hasSubChapters || false
          }
        },
        upsert: true
      }
    }))

    if (operations.length > 0) {
      const result = await Chapter.bulkWrite(operations)
      console.log(`✅ Bulk write complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`)
    }

    console.log("✅ Chapters Imported/Updated Successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error with data import:", error)
    process.exit(1)
  }
}

importData()
