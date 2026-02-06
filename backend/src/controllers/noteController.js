import Note from "../models/Note.js"
import Chapter from "../models/Chapter.js"
import { validateNote } from "../middleware/validation.js"
import { createSlug } from "../utils/helpers.js"
import { createBasePDF, renderMarkdownToPDF, finalizePDF } from "../utils/pdfHelpers.js"
import { sendNotesUploadNotification } from "../utils/notificationService.js"

const frontendUrl = process.env.FRONTEND_URL || ""
const frontendBaseUrl = frontendUrl.replace(/\/$/, "")

// Admin: Create note
export const createNote = async (req, res) => {
  try {
    const { error, value } = validateNote(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    // Generate slug if not provided
    if (!value.slug) {
      value.slug = createSlug(value.title)
    }

    // Check if slug already exists
    const existingNote = await Note.findOne({ slug: value.slug })
    if (existingNote) {
      return res.status(400).json({ message: "Note slug already exists" })
    }

    // Ensure chapter exists (auto-create if missing)
    if (value.chapter && value.chapter.trim()) {
      const chapterTitle = value.chapter.trim()
      const existingChapter = await Chapter.findOne({ title: chapterTitle })
      if (!existingChapter) {
        // Create slug from title if missing
        const slug = createSlug(chapterTitle)
        await Chapter.create({
          title: chapterTitle,
          slug,
          description: `Topics for ${chapterTitle}`,
          icon: "BookOpen",
          gradient: "from-gray-500/80 to-gray-600/80",
        })
      }
    }

    const note = await Note.create(value)

    // Send notification email to all users with the note URL
    try {
      let chapterSlug = note.chapterId || "general"

      // If chapterId is missing (legacy or missing from request), try to find it by name
      if (!note.chapterId && note.chapter) {
        const ch = await Chapter.findOne({ title: note.chapter })
        if (ch) chapterSlug = ch.slug
      }

      const noteUrl = `${frontendBaseUrl}/notes/${chapterSlug}/${note.slug}`
      await sendNotesUploadNotification(note, noteUrl)
    } catch (notificationError) {
      console.error("⚠️ Failed to send notes upload notification:", notificationError.message)
    }

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Update note
export const updateNote = async (req, res) => {
  try {
    const { error, value } = validateNote(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const note = await Note.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    })

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Delete note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id)

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get all notes (with filters)
export const getNotes = async (req, res) => {
  try {
    const { category, chapter, chapterId, difficulty, isPremium } = req.query

    let filter = { status: "Published" }

    if (category) filter.category = category
    if (chapter) filter.chapter = chapter
    if (chapterId) filter.chapterId = chapterId
    if (difficulty) filter.difficulty = difficulty
    if (isPremium === "true") filter.isPremium = true

    const notes = await Note.find(filter).select("-password").sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get single note by ID
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    // Increment views
    note.views += 1
    await note.save()

    res.status(200).json({
      success: true,
      note,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get note by slug
export const getNoteBySlug = async (req, res) => {
  try {
    const note = await Note.findOne({ slug: req.params.slug })

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    // Increment views
    note.views += 1
    await note.save()

    res.status(200).json({
      success: true,
      note,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Get all notes (including drafts)
export const getAllNotes = async (req, res) => {
  try {
    const { category, status } = req.query

    let filter = {}
    if (category) filter.category = category
    if (status) filter.status = status

    const notes = await Note.find(filter).sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Download note as PDF
export const downloadNoteAsPDF = async (req, res) => {
  try {
    const { id } = req.params

    const note = await Note.findById(id)
    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    // Create PDF document using helper
    const doc = createBasePDF(note.title)

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf"`)

    // Pipe PDF to response
    doc.pipe(res)

    // Header Metadata
    doc.fontSize(28).font("Helvetica-Bold").fillColor("#0066cc").text(note.title, { align: "left" })
    doc.moveDown(0.2)

    doc.fontSize(10).font("Helvetica-Bold").fillColor("#444444")
    doc.text(`Category: `, { continued: true }).font("Helvetica").text(note.category, { continued: true })
    doc.font("Helvetica-Bold").text(`  |  Difficulty: `, { continued: true }).font("Helvetica").text(note.difficulty, { continued: true })
    doc.font("Helvetica-Bold").text(`  |  Chapter: `, { continued: true }).font("Helvetica").text(note.chapter)

    doc.fontSize(10).font("Helvetica-Bold").text(`Author: `, { continued: true }).font("Helvetica").text(note.author || "Education Team", { continued: true })
    doc.font("Helvetica-Bold").text(`  |  Reading Time: `, { continued: true }).font("Helvetica").text(note.readingTime || "5 min")
    doc.moveDown(1)

    // Add separator line
    doc.strokeColor("#e0e0e0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(1.5)

    // Render markdown content using helper
    const safeContent = typeof note.content === "string" ? note.content : ""
    doc.fillColor("#000000")
    renderMarkdownToPDF(doc, safeContent)

    // Finalize with numbering and footer using helper
    finalizePDF(doc, note.title)

    doc.end()
  } catch (error) {
    console.error("PDF generation error:", error)
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF", error: error.message })
    } else {
      res.end()
    }
  }
}
