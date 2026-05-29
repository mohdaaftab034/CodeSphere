import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import Chapter from "../src/models/Chapter.js"
import { connectDB } from "../src/config/database.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env") })

const fix = async () => {
    try {
        await connectDB()

        // Update DSA
        const dsa = await Chapter.findOneAndUpdate(
            { title: /Data Structures/i },
            {
                slug: "data-structures-algorithms",
                navPath: "/notes/data-structures-algorithms"
            },
            { new: true }
        )
        console.log("Updated DSA:", dsa ? "Success" : "Not Found")


        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

fix()
