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

const toTitleCase = (value = "") =>
  value
    .toString()
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

const buildLooseRegex = (slug = "") => {
  const cleaned = slug.toString().toLowerCase().replace(/[^a-z0-9]/g, "")
  if (!cleaned) return null
  const pattern = cleaned.split("").map((char) => char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("\\W*")
  return new RegExp(`^${pattern}$`, "i")
}

const buildLooseContainsRegex = (slug = "") => {
  const cleaned = slug.toString().toLowerCase().replace(/[^a-z0-9]/g, "")
  if (!cleaned) return null
  const pattern = cleaned.split("").map((char) => char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("\\W*")
  return new RegExp(pattern, "i")
}

const normalizeDifficulty = (slug = "") => {
  const normalized = slug.toString().trim().toLowerCase()
  if (normalized === "easy" || normalized === "beginner") return ["Easy", "Beginner"]
  if (normalized === "medium" || normalized === "intermediate") return ["Medium", "Intermediate"]
  if (normalized === "hard" || normalized === "advanced") return ["Hard", "Advanced"]
  return []
}

const normalizeListInput = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === "string" ? item.split(",") : []))
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const uniqueList = (items) => {
  const result = []
  for (const item of items) {
    if (!result.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      result.push(item)
    }
  }
  return result
}

const buildFilterByType = (type, slug) => {
  const filter = { isPublished: { $ne: false } }

  switch (type) {
    case "topic": {
      const regex = buildLooseContainsRegex(slug)
      if (!regex) return null
      filter.topics = { $regex: regex }
      return filter
    }
    case "company": {
      const regex = buildLooseContainsRegex(slug)
      if (!regex) return null
      filter.companies = { $regex: regex }
      return filter
    }
    case "role": {
      const regex = buildLooseContainsRegex(slug)
      if (!regex) return null
      filter.roles = { $regex: regex }
      return filter
    }
    case "difficulty": {
      const values = normalizeDifficulty(slug)
      if (values.length) {
        filter.difficulty = { $in: values }
      } else {
        const regex = buildLooseRegex(slug)
        if (!regex) return null
        filter.difficulty = { $regex: regex }
      }
      return filter
    }
    default:
      return null
  }
}

// Admin: Create interview question
export const createInterviewQuestion = async (req, res) => {
  try {
    const { error, value } = validateInterviewQuestion(req.body)
    if (error) {
      console.error("Validation error:", error.details[0].message, "Field:", error.details[0].context.key)
      return res.status(400).json({ message: error.details[0].message })
    }

    const normalized = {
      ...value,
      roles: uniqueList(normalizeListInput(value.roles)),
      topics: uniqueList(normalizeListInput(value.topics)),
      companies: uniqueList(normalizeListInput(value.companies)),
      difficulty: typeof value.difficulty === "string" ? value.difficulty.trim() : value.difficulty,
    }

    // Ensure roles is an array and not empty
    if (!normalized.roles || normalized.roles.length === 0) {
      return res.status(400).json({ message: "At least one role must be selected" })
    }

    const question = await InterviewQuestion.create(normalized)

    // Send notification email to all users with direct link to the question
    try {
      const questionUrl = `${frontendBaseUrl}/interview/question/${question._id}`
      await sendInterviewQuestionNotification(question, questionUrl)
    } catch (notificationError) {
      console.error("Failed to send interview question notification:", notificationError.message)
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

    const normalized = {
      ...value,
      roles: uniqueList(normalizeListInput(value.roles)),
      topics: uniqueList(normalizeListInput(value.topics)),
      companies: uniqueList(normalizeListInput(value.companies)),
      difficulty: typeof value.difficulty === "string" ? value.difficulty.trim() : value.difficulty,
    }

    const question = await InterviewQuestion.findByIdAndUpdate(req.params.id, normalized, {
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
      const roleRegex = buildLooseContainsRegex(role)
      filter.roles = roleRegex ? { $regex: roleRegex } : role
    }

    filter.isPublished = { $ne: false }

    if (difficulty) {
      filter.difficulty = difficulty
    }

    if (subject) {
      filter.subject = subject
    }

    const questions = await InterviewQuestion.find(filter).sort({ createdAt: -1 })

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
      const roleRegex = buildLooseContainsRegex(role)
      filter.roles = roleRegex ? { $regex: roleRegex } : role
    }

    const questions = await InterviewQuestion.find(filter).sort({ createdAt: -1 })

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

    const questions = await InterviewQuestion.find(filter).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Generate PDF for role-specific questions
export const generateRolePDF = async (req, res) => {
  try {
    const { role } = req.params

    // Fetch questions for this role - use more robust matching
    // We search case-insensitively and handle both slug and name if possible
    const questions = await InterviewQuestion.find({
      roles: { $regex: buildLooseContainsRegex(role) || role },
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

// User: Get questions by topic/company/role/difficulty
export const getQuestionsByType = async (req, res) => {
  try {
    const pathParts = req.path.split("/").filter(Boolean)
    const resolvedType = req.params.type || pathParts[0]
    const resolvedSlug = req.params.slug || pathParts[1]
    const filter = buildFilterByType(resolvedType, resolvedSlug)

    if (!filter) {
      return res.status(400).json({ message: "Invalid filter type or slug" })
    }

    const questions = await InterviewQuestion.find(filter).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Generate PDF for topic/company/role/difficulty
export const generateFilteredPDF = async (req, res) => {
  try {
    const { type, slug } = req.params

    const filter = buildFilterByType(type, slug)
    if (!filter) {
      return res.status(400).json({ message: "Invalid filter type or slug" })
    }

    const questions = await InterviewQuestion.find(filter).sort({ difficulty: 1, createdAt: -1 })

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this selection" })
    }

    let titleSuffix = toTitleCase(slug)
    if (type === "difficulty") {
      const normalized = normalizeDifficulty(slug)[0] || toTitleCase(slug)
      titleSuffix = normalized
    }

    const pageTitle = `${titleSuffix} Interview Questions`

    const doc = createBasePDF(pageTitle)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${slug}-interview-questions.pdf"`)

    doc.pipe(res)

    doc.fontSize(24).font("Helvetica-Bold").fillColor("#0066cc").text(pageTitle, { align: "center" })
    doc.moveDown(0.2)
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`Total Questions: ${questions.length}  |  Generated on: ${new Date().toLocaleDateString()}`, { align: "center" })
    doc.moveDown(2)

    questions.forEach((question, index) => {
      if (doc.y > doc.page.height - 150) {
        doc.addPage()
      }

      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1e40af")
      doc.text(`Question ${index + 1}`, { continued: true })
      doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`  [${question.difficulty}]`, { align: "right" })
      doc.moveDown(0.5)

      doc.fontSize(13).font("Helvetica-Bold").fillColor("#000000")
      doc.text(question.question, { align: "left" })
      doc.moveDown(0.3)

      if (question.description) {
        doc.fontSize(10).font("Helvetica-Oblique").fillColor("#444444")
        doc.text(question.description)
        doc.moveDown(0.5)
      }

      const content = question.content || question.answer || "No answer provided."
      doc.fillColor("#000000")
      renderMarkdownToPDF(doc, content)

      if (index < questions.length - 1) {
        doc.moveDown(1)
        doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
        doc.moveDown(1.5)
      }
    })

    finalizePDF(doc, pageTitle)

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

// User/Admin: Get interview meta lists for dynamic forms
export const getInterviewMeta = async (req, res) => {
  try {
    const [roles, topics, companies, difficulties] = await Promise.all([
      InterviewQuestion.distinct("roles"),
      InterviewQuestion.distinct("topics"),
      InterviewQuestion.distinct("companies"),
      InterviewQuestion.distinct("difficulty"),
    ])

    const normalize = (items) =>
      uniqueList(normalizeListInput(items))
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
        .sort((a, b) => a.localeCompare(b))

    res.status(200).json({
      success: true,
      meta: {
        roles: normalize(roles),
        topics: normalize(topics),
        companies: normalize(companies),
        difficulties: normalize(difficulties),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
