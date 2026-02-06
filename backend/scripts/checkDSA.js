import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import Chapter from "../src/models/Chapter.js"
import { connectDB } from "../src/config/database.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env") })

const check = async () => {
    try {
        await connectDB()
        const chapters = await Chapter.find({ title: /Structure/i })
        console.log("CHAPTERS FOUND:", JSON.stringify(chapters.map(c => ({ id: c._id, title: c.title, slug: c.slug })), null, 2))
        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

check()
