import InterviewQuestion from "../models/InterviewQuestion.js"
import { validateInterviewQuestion } from "../middleware/validation.js"
import { createBasePDF, renderMarkdownToPDF, finalizePDF } from "../utils/pdfHelpers.js"
import { sendInterviewQuestionNotification } from "../utils/notificationService.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const websiteName = process.env.WEBSITE_NAME || "CodeSphere"
const frontendUrl = process.env.FRONTEND_URL || ""
const frontendBaseUrl = frontendUrl.replace(/\/$/, "")

// Admin: Create interview question
export const createInterviewQuestion = async (req, res) => {
  try {
    const { error, value } = validateInterviewQuestion(req.body)
    if (error) {
      console.error("Validation error:", error.details[0].message, "Field:", error.details[0].context.key)
      return res.status(400).json({ message: error.details[0].message })
    }

    // Ensure roles is an array and not empty
    if (!value.roles || value.roles.length === 0) {
      return res.status(400).json({ message: "At least one role must be selected" })
    }

    const question = await InterviewQuestion.create(value)

    // Send notification email to all users with direct link to the question
    try {
      const questionUrl = `${frontendBaseUrl}/interview/question/${question._id}`
      await sendInterviewQuestionNotification(question, questionUrl)
    } catch (notificationError) {
      console.error("⚠️ Failed to send interview question notification:", notificationError.message)
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Interview question created successfully",
      question,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Update interview question
export const updateInterviewQuestion = async (req, res) => {
  try {
    const { error, value } = validateInterviewQuestion(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const question = await InterviewQuestion.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    })

    if (!question) {
      return res.status(404).json({ message: "Interview question not found" })
    }

    res.status(200).json({
      success: true,
      message: "Interview question updated successfully",
      question,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Delete interview question
export const deleteInterviewQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.findByIdAndDelete(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Interview question not found" })
    }

    res.status(200).json({
      success: true,
      message: "Interview question deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get questions by role
export const getQuestionsByRole = async (req, res) => {
  try {
    const { role, difficulty, subject } = req.query

    let filter = {}

    if (role) {
      filter.roles = { $regex: new RegExp(`^${role.replace(/-/g, " ")}$`, "i") }
    }

    filter.isPublished = { $ne: false }

    if (difficulty) {
      filter.difficulty = difficulty
    }

    if (subject) {
      filter.subject = subject
    }

    const questions = await InterviewQuestion.find(filter)

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const { subject, difficulty, role } = req.query
    let filter = {}

    if (subject) {
      filter.subject = subject
    }

    if (difficulty) {
      filter.difficulty = difficulty
    }

    if (role) {
      filter.roles = { $regex: new RegExp(`^${role.replace(/-/g, " ")}$`, "i") }
    }

    const questions = await InterviewQuestion.find(filter)

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get single question
export const getQuestionById = async (req, res) => {
  try {
    const question = await InterviewQuestion.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Interview question not found" })
    }

    // Increment views
    question.views += 1
    await question.save()

    res.status(200).json({
      success: true,
      question,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Get all questions (for management)
export const getAdminQuestions = async (req, res) => {
  try {
    const { role, difficulty } = req.query

    let filter = {}

    if (role) {
      filter.roles = role
    }

    if (difficulty) {
      filter.difficulty = difficulty
    }

    const questions = await InterviewQuestion.find(filter)

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Generate PDF for role-specific questions (Premium Feature)
export const generateRolePDF = async (req, res) => {
  try {
    const { role } = req.params

    // Premium Check
    if (!req.user || (!req.user.isPaid && req.user.role !== "admin")) {
      return res.status(403).json({
        message: "Premium subscription required to download interview questions as PDF",
        isPremiumRequired: true
      })
    }

    // Fetch questions for this role - use more robust matching
    // We search case-insensitively and handle both slug and name if possible
    const questions = await InterviewQuestion.find({
      roles: { $regex: new RegExp(`^${role.replace(/-/g, " ")}$`, "i") },
      isPublished: { $ne: false }
    }).sort({ difficulty: 1, createdAt: -1 })

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this role" })
    }

    // Create PDF document using helper
    const doc = createBasePDF(`${role} Interview Questions`)

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${role.replace(/\s+/g, "-")}-interview-questions.pdf"`)

    // Pipe PDF to response
    doc.pipe(res)

    // Header
    doc.fontSize(24).font("Helvetica-Bold").fillColor("#0066cc").text(`${role} Interview Questions`, { align: "center" })
    doc.moveDown(0.2)
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`Total Questions: ${questions.length}  |  Generated on: ${new Date().toLocaleDateString()}`, { align: "center" })
    doc.moveDown(2)

    // Add each question
    questions.forEach((question, index) => {
      // Avoid page break issues for questions
      if (doc.y > doc.page.height - 150) {
        doc.addPage()
      }

      // Question number and difficulty
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1e40af")
      doc.text(`Question ${index + 1}`, { continued: true })
      doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`  [${question.difficulty}]`, { align: "right" })
      doc.moveDown(0.5)

      // Question text
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#000000")
      doc.text(question.question, { align: "left" })
      doc.moveDown(0.5)

      // Answer/Content
      const content = question.content || question.answer || "No answer provided."
      doc.fillColor("#000000")
      renderMarkdownToPDF(doc, content)

      // Question separator - only if not the last question
      if (index < questions.length - 1) {
        doc.moveDown(1)
        doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
        doc.moveDown(1.5)
      }
    })

    // Finalize with numbering and footer using helper
    finalizePDF(doc, `${role} Interview Questions`)

    doc.end()
  } catch (error) {
    console.error("Interview PDF generation error:", error)
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF", error: error.message })
    } else {
      res.end()
    }
  }
}

// Admin: Manually trigger daily interview question notification
export const triggerDailyQuestion = async (req, res) => {
  try {
    // Fetch a random published interview question
    const questions = await InterviewQuestion.find({ isPublished: true }).lean()

    if (questions.length === 0) {
      return res.status(404).json({ message: "No published interview questions available" })
    }

    // Select a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

    // Send notification to all users with direct link to the question
    const questionUrl = `${frontendBaseUrl}/interview/question/${randomQuestion._id}`
    const result = await sendInterviewQuestionNotification(randomQuestion, questionUrl)

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Daily interview question notification sent successfully",
        question: randomQuestion,
        usersNotified: result.usersNotified,
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error: result.error,
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get available subjects
export const getSubjects = async (req, res) => {
  try {
    const subjectsPath = path.join(__dirname, "../config/subjects.json")
    const subjectsData = fs.readFileSync(subjectsPath, "utf-8")
    const subjects = JSON.parse(subjectsData)

    res.status(200).json({
      success: true,
      subjects,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
