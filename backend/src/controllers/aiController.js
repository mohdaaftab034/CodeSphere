import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * @desc    Ask a doubt about a note
 * @route   POST /api/ai/ask
 * @access  Private (Paid users only)
 */
export const askDoubt = async (req, res) => {
    try {
        const { noteTitle, noteContent, question } = req.body

        if (!question) {
            return res.status(400).json({ message: "Please provide a question" })
        }

        if (!noteContent) {
            return res.status(400).json({ message: "Note content is missing" })
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY is missing from environment")
            return res.status(500).json({ message: "AI Configuration Error: API Key missing" })
        }

        // Re-initialize genAI here to ensure it uses the latest API key if it changes during runtime
        // Although typically process.env variables are loaded once at app start.
        const genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

        // Use gemini-1.5-flash-latest as it's the alias for the latest stable build
        const model = genAIInstance.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        })

        const prompt = `
            You are an expert AI tutor for CodeSphere.
            Context: The user is reading a note titled "${noteTitle}".
            
            Note Content:
            """
            ${noteContent}
            """
            
            User Question: "${question}"
            
            Instructions:
            1. Provide a clear, accurate, and concise answer.
            2. Base your answer primarily on the note content provided above.
            3. Use professional and helpful tone.
            4. If the question is completely unrelated, briefly mention how it relates or guide them back.
        `

        console.log(`🤖 AI Request: Question="${question}" for Note="${noteTitle}"`)

        const result = await model.generateContent(prompt)
        const response = await result.response

        if (!response) {
            throw new Error("Empty response from AI service")
        }

        const text = response.text()

        if (!text) {
            throw new Error("AI returned no text (check safety filters)")
        }

        res.status(200).json({
            success: true,
            answer: text,
        })
    } catch (error) {
        console.error("❌ AI Generation Error:", error)
        res.status(500).json({
            success: false,
            message: "AI failed to generate a response",
            error: error.message || "Unknown error"
        })
    }
}
