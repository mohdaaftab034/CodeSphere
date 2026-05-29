import Groq from "groq-sdk"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import User from "../models/User.js"

const FREE_AI_MESSAGE_LIMIT = 10
const DEFAULT_GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, "../../.env")

const ensureGroqEnv = () => {
    if (!process.env.GROQ_API_KEY) {
        dotenv.config({ path: envPath })
    }
}

const hasActiveSubscription = (user) => {
    if (!user?.isPaid || !user.subscriptionExpiresAt) {
        return false
    }

    return new Date() <= new Date(user.subscriptionExpiresAt)
}

const getGroqModels = () => {
    const fromEnv = process.env.GROQ_MODELS || process.env.GROQ_MODEL
    if (!fromEnv) {
        return DEFAULT_GROQ_MODELS
    }

    const parsedModels = fromEnv
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean)

    return parsedModels.length > 0 ? parsedModels : DEFAULT_GROQ_MODELS
}

/**
 * @desc    Ask a doubt about a note
 * @route   POST /api/ai/ask
 * @access  Private
 */
export const askDoubt = async (req, res) => {
    let reservedFreeMessage = false

    try {
        ensureGroqEnv()
        const currentFreeMessagesUsed = req.user?.aiMessagesUsed || 0
        const { noteTitle, noteContent, question } = req.body

        if (!question) {
            return res.status(400).json({ message: "Please provide a question" })
        }

        if (!noteContent) {
            return res.status(400).json({ message: "Note content is missing" })
        }

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY is missing from environment")
            return res.status(500).json({ message: "AI Configuration Error: API Key missing" })
        }


        const freshUser = await User.findById(req.user.id).select("aiMessagesUsed isPaid subscriptionExpiresAt")
        if (!freshUser) {
            return res.status(404).json({ message: "User not found" })
        }

        const isPaidUser = hasActiveSubscription(freshUser)
        const storedFreeMessagesUsed = freshUser.aiMessagesUsed || 0

        if (!isPaidUser) {
            if (storedFreeMessagesUsed >= FREE_AI_MESSAGE_LIMIT) {
                return res.status(403).json({
                    success: false,
                    code: "SUBSCRIPTION_REQUIRED",
                    message: "You have used all 10 free AI messages. Subscribe to continue using the AI Doubt Solver.",
                    freeMessageLimit: FREE_AI_MESSAGE_LIMIT,
                    remainingFreeMessages: 0,
                })
            }

            const reservedUser = await User.findByIdAndUpdate(
                req.user.id,
                { $inc: { aiMessagesUsed: 1 } },
                { new: true }
            ).select("aiMessagesUsed")

            if (!reservedUser) {
                return res.status(404).json({ message: "User not found" })
            }

            reservedFreeMessage = true
            req.user.aiMessagesUsed = reservedUser.aiMessagesUsed || 0
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

        console.log(`AI Request: Question="${question}" for Note="${noteTitle}"`)

        const modelCandidates = getGroqModels()
        let completion = null
        let lastModelError = null

        for (const modelName of modelCandidates) {
            try {
                completion = await groq.chat.completions.create({
                    model: modelName,
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert AI tutor for CodeSphere. Provide accurate, concise, helpful explanations grounded in the supplied note content.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                })
                break
            } catch (modelError) {
                lastModelError = modelError
                const errorCode = modelError?.error?.error?.code || modelError?.error?.code

                // Try the next model only when current one is no longer available.
                if (errorCode !== "model_decommissioned") {
                    throw modelError
                }
            }
        }

        if (!completion) {
            throw lastModelError || new Error("AI model is currently unavailable")
        }

        const text = completion.choices?.[0]?.message?.content?.trim()

        if (!text) {
            throw new Error("AI returned no text")
        }

        res.status(200).json({
            success: true,
            answer: text,
            usage: {
                aiMessagesUsed: req.user?.isPaid ? null : currentFreeMessagesUsed + (reservedFreeMessage ? 1 : 0),
                freeMessageLimit: FREE_AI_MESSAGE_LIMIT,
                remainingFreeMessages: req.user?.isPaid ? null : Math.max(FREE_AI_MESSAGE_LIMIT - (currentFreeMessagesUsed + (reservedFreeMessage ? 1 : 0)), 0),
                isPaidUser,
            },
        })
    } catch (error) {
        if (reservedFreeMessage) {
            try {
                await User.findOneAndUpdate(
                    {
                        _id: req.user.id,
                        aiMessagesUsed: { $gt: 0 },
                    },
                    {
                        $inc: { aiMessagesUsed: -1 },
                    }
                )
            } catch (rollbackError) {
                console.error("Failed to rollback AI message quota:", rollbackError)
            }
        }

        console.error("AI Generation Error:", error)
        res.status(500).json({
            success: false,
            message: "AI failed to generate a response",
            error: error.message || "Unknown error"
        })
    }
}
