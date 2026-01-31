import InterviewQuestion from "../models/InterviewQuestion.js"
import { validateInterviewQuestion } from "../middleware/validation.js"
import PDFDocument from "pdfkit"
import { sendInterviewQuestionNotification } from "../utils/notificationService.js"

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

    // Send notification email to all users
    try {
      await sendInterviewQuestionNotification(question)
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

// User: Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await InterviewQuestion.find()

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

// User: Generate PDF for role-specific questions
export const generateRolePDF = async (req, res) => {
  try {
    const { role } = req.params

    // Fetch questions for this role
    const questions = await InterviewQuestion.find({ roles: role })

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this role" })
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: "A4" })

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${role.replace(/\s+/g, "-")}-interview-questions.pdf"`)

    // Pipe the PDF to the response
    doc.pipe(res)

    // Add title
    doc.fontSize(24).font("Helvetica-Bold").text(`${role} Interview Questions`, { align: "center" })
    doc.moveDown()
    doc.fontSize(12).font("Helvetica").text(`Total Questions: ${questions.length}`, { align: "center" })
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" })
    doc.moveDown(2)

    // Add each question
    questions.forEach((question, index) => {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage()
      }

      // Question number and difficulty
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af")
      doc.text(`Question ${index + 1}`, { continued: false })
      doc.fontSize(10).font("Helvetica").fillColor("#666666")
      doc.text(`Difficulty: ${question.difficulty}`, { align: "right" })
      doc.moveDown(0.5)

      // Question text
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000")
      doc.text(question.question, { align: "left" })
      doc.moveDown()

      // Answer - use content if available, otherwise answer
      const answerText = question.content || question.answer
      
      // Helper function to parse and format markdown text
      const parseMarkdownLine = (text, doc) => {
        // Detect heading levels
        const headingMatch = text.match(/^(#{1,6})\s+(.+)$/)
        if (headingMatch) {
          const level = headingMatch[1].length
          const headingText = headingMatch[2]
          const sizes = { 1: 16, 2: 14, 3: 12, 4: 12, 5: 11, 6: 11 }
          doc.fontSize(sizes[level]).font("Helvetica-Bold").fillColor("#000000")
          doc.text(headingText, { continued: false })
          return true
        }
        
        // Parse bold, italic, and other inline markdown
        const parts = []
        let remaining = text
        let lastIndex = 0
        
        // Regex to match **bold**, *italic*, and combinations
        const markdownRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
        let match
        
        while ((match = markdownRegex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.substring(lastIndex, match.index) })
          }
          
          // Add the formatted text
          const matched = match[0]
          if (matched.startsWith('**') && matched.endsWith('**')) {
            parts.push({ type: 'bold', content: matched.slice(2, -2) })
          } else if (matched.startsWith('*') && matched.endsWith('*')) {
            parts.push({ type: 'italic', content: matched.slice(1, -1) })
          }
          
          lastIndex = match.index + matched.length
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
          parts.push({ type: 'text', content: text.substring(lastIndex) })
        }
        
        // If no markdown was found, just add the whole text
        if (parts.length === 0) {
          parts.push({ type: 'text', content: text })
        }
        
        // Render parts
        if (parts.length > 0) {
          doc.fontSize(11).fillColor("#1a1a1a")
          let currentX = doc.x
          
          parts.forEach((part, idx) => {
            if (part.type === 'text') {
              doc.font("Helvetica")
              doc.text(part.content, { continued: idx < parts.length - 1 })
            } else if (part.type === 'bold') {
              doc.font("Helvetica-Bold")
              doc.text(part.content, { continued: idx < parts.length - 1 })
            } else if (part.type === 'italic') {
              doc.font("Helvetica-Oblique")
              doc.text(part.content, { continued: idx < parts.length - 1 })
            }
          })
          
          return true
        }
        
        return false
      }
      
      // Parse content for code blocks
      if (question.content) {
        const lines = answerText.split("\n")
        let inCodeBlock = false
        let codeLanguage = ""

        lines.forEach((line) => {
          if (line.trim().startsWith("```")) {
            if (!inCodeBlock) {
              // Start of code block
              inCodeBlock = true
              codeLanguage = line.replace(/```/g, "").trim()
              doc.moveDown(0.5)
              doc.fontSize(9).font("Courier").fillColor("#1e3a8a")
              if (codeLanguage) {
                doc.text(`[${codeLanguage}]`, { continued: false })
              }
            } else {
              // End of code block
              inCodeBlock = false
              doc.moveDown(0.5)
            }
          } else {
            if (inCodeBlock) {
              // Inside code block - use monospace font
              doc.fontSize(9).font("Courier").fillColor("#1e3a8a")
              doc.text(line, { continued: false })
            } else {
              // Regular text - parse markdown
              if (line.trim().length > 0) {
                doc.fontSize(11).fillColor("#1a1a1a")
                parseMarkdownLine(line, doc)
              } else {
                doc.moveDown(0.3)
              }
            }
          }
        })
      } else {
        // Plain answer text
        doc.fontSize(11).font("Helvetica").fillColor("#1a1a1a")
        doc.text(answerText, { align: "left" })
      }

      doc.moveDown(2)

      // Add separator line
      if (index < questions.length - 1) {
        doc.strokeColor("#e5e7eb").lineWidth(1)
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
        doc.moveDown()
      }
    })

    // Add footer on last page
    doc.fontSize(9).fillColor("#666666").text(
      "Generated by Coding Notes Platform",
      50,
      doc.page.height - 50,
      { align: "center" }
    )

    // Finalize PDF
    doc.end()
  } catch (error) {
    console.error("PDF generation error:", error)
    res.status(500).json({ message: error.message })
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

    // Send notification to all users
    const result = await sendInterviewQuestionNotification(randomQuestion)

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
