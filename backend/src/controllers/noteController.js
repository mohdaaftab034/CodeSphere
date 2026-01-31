import Note from "../models/Note.js"
import Chapter from "../models/Chapter.js"
import { validateNote } from "../middleware/validation.js"
import { createSlug } from "../utils/helpers.js"
import PDFDocument from "pdfkit"
import { sendNotesUploadNotification } from "../utils/notificationService.js"

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
      const noteUrl = `https://codenotes.dev/notes/${note.slug}`
      await sendNotesUploadNotification(note, noteUrl)
    } catch (notificationError) {
      console.error("⚠️ Failed to send notes upload notification:", notificationError.message)
      // Don't fail the request if notification fails
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
    const { category, chapter, difficulty, isPremium } = req.query

    let filter = { status: "Published" }

    if (category) filter.category = category
    if (chapter) filter.chapter = chapter
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
// Helper function to render markdown content to PDF with proper formatting
const renderMarkdownToPDF = (doc, markdown) => {
  const lines = markdown.split("\n")
  let inCodeBlock = false
  let codeBlockContent = []
  let codeLanguage = ""
  const baseTextOptions = { width: 500, lineGap: 4 }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block - render accumulated content
        inCodeBlock = false
        
        // Render code block with background
        doc.fontSize(9).font("Courier").fillColor("#000000")
        
        const startY = doc.y
        const codeBlockHeight = codeBlockContent.length * 13 + 12
        
        // Draw background rectangle
        doc.rect(45, startY, 510, codeBlockHeight).fillAndStroke("#f8f8f8", "#d0d0d0")
        
        // Draw code lines
        doc.y = startY + 6
        codeBlockContent.forEach((codeLine) => {
          doc.fontSize(9).font("Courier").fillColor("#333333")
          doc.text(codeLine || " ", { width: 480, lineBreak: false })
          doc.moveDown(0.4)
        })
        
        doc.moveDown(0.5)
        doc.fillColor("#000000")
        doc.font("Helvetica")
        codeBlockContent = []
        codeLanguage = ""
      } else {
        // Start of code block
        inCodeBlock = true
        codeLanguage = line.trim().substring(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // Skip empty lines but add spacing
    if (!line.trim()) {
      doc.moveDown(0.6)
      continue
    }

    // H1 headings (# )
    if (/^# /.test(line)) {
      const headingText = line.replace(/^#+\s+/, "")
      doc.fontSize(20).font("Helvetica-Bold").fillColor("#1a1a1a")
      doc.text(headingText, { ...baseTextOptions })
      doc.moveDown(0.4)
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(45, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.8)
      continue
    }

    // H2 headings (## )
    if (/^## /.test(line)) {
      const headingText = line.replace(/^#+\s+/, "")
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#333333")
      doc.text(headingText, { ...baseTextOptions })
      doc.moveDown(0.5)
      continue
    }

    // H3 headings (### )
    if (/^### /.test(line)) {
      const headingText = line.replace(/^#+\s+/, "")
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#555555")
      doc.text(headingText, { ...baseTextOptions })
      doc.moveDown(0.4)
      continue
    }

    // H4 headings (#### )
    if (/^#### /.test(line)) {
      const headingText = line.replace(/^#+\s+/, "")
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#666666")
      doc.text(headingText, { ...baseTextOptions })
      doc.moveDown(0.4)
      continue
    }

    // Block quotes
    if (/^>\s/.test(line)) {
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#666666")
      const quoteText = line.replace(/^>\s+/, "")
      doc.rect(45, doc.y, 510, 1).fill("#bbbbbb")
      doc.moveDown(0.2)
      doc.text(quoteText, { width: 480, indent: 20, lineGap: 4 })
      doc.moveDown(0.6)
      continue
    }

    // Unordered lists (-, *, +)
    if (/^\s*[-*+]\s/.test(line)) {
      const indent = line.match(/^\s*/)[0].length
      const listItem = line.replace(/^\s*[-*+]\s+/, "")
      doc.fontSize(11).font("Helvetica").fillColor("#000000")
      doc.text("• " + listItem, { width: 480, indent: 20 + indent, lineGap: 4 })
      doc.moveDown(0.3)
      continue
    }

    // Ordered lists
    if (/^\s*\d+\.\s/.test(line)) {
      const match = line.match(/^(\s*)(\d+)\.\s+(.*)/)
      if (match) {
        const indent = match[1].length
        const num = match[2]
        const text = match[3]
        doc.fontSize(11).font("Helvetica").fillColor("#000000")
        doc.text(`${num}. ${text}`, { width: 480, indent: 20 + indent, lineGap: 4 })
        doc.moveDown(0.3)
        continue
      }
    }

    // Regular paragraph with inline formatting
    doc.fontSize(11).font("Helvetica").fillColor("#000000")
    renderInlineMarkdown(doc, line)
    doc.moveDown(0.6)
  }
}

// Helper to render inline markdown with proper formatting
const renderInlineMarkdown = (doc, text) => {
  const parts = []
  let current = ""
  let i = 0

  while (i < text.length) {
    // Bold **text**
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2)
      if (end !== -1) {
        if (current) parts.push({ type: "normal", text: current })
        parts.push({ type: "bold", text: text.substring(i + 2, end) })
        current = ""
        i = end + 2
        continue
      }
    }

    // Italic *text*
    if (text[i] === "*") {
      const end = text.indexOf("*", i + 1)
      if (end !== -1) {
        if (current) parts.push({ type: "normal", text: current })
        parts.push({ type: "italic", text: text.substring(i + 1, end) })
        current = ""
        i = end + 1
        continue
      }
    }

    // Inline code `code`
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1)
      if (end !== -1) {
        if (current) parts.push({ type: "normal", text: current })
        parts.push({ type: "code", text: text.substring(i + 1, end) })
        current = ""
        i = end + 1
        continue
      }
    }

    // Links [text](url)
    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1)
      const openParen = text.indexOf("(", closeBracket + 1)
      const closeParen = text.indexOf(")", openParen + 1)
      if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
        if (current) parts.push({ type: "normal", text: current })
        const linkText = text.substring(i + 1, closeBracket)
        const url = text.substring(openParen + 1, closeParen)
        parts.push({ type: "link", text: linkText, url })
        current = ""
        i = closeParen + 1
        continue
      }
    }

    current += text[i]
    i += 1
  }

  if (current) parts.push({ type: "normal", text: current })

  // Render all parts
  parts.forEach((part) => {
    switch (part.type) {
      case "bold":
        doc.font("Helvetica-Bold").text(part.text, { continued: true, lineGap: 4 })
        doc.font("Helvetica")
        break
      case "italic":
        doc.font("Helvetica-Oblique").text(part.text, { continued: true, lineGap: 4 })
        doc.font("Helvetica")
        break
      case "code":
        doc.fillColor("#d63384").font("Courier").text(part.text, { continued: true, lineGap: 4 })
        doc.fillColor("#000000").font("Helvetica")
        break
      case "link":
        doc.fillColor("#0066cc").text(part.text, { continued: true, lineGap: 4 })
        doc.fillColor("#000000")
        break
      case "normal":
      default:
        doc.text(part.text, { continued: true, lineGap: 4 })
    }
  })

  doc.text("", { lineGap: 4 }) // End the line
}

export const downloadNoteAsPDF = async (req, res) => {
  try {
    const { id } = req.params

    const note = await Note.findById(id)
    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    // Create PDF document
    const doc = new PDFDocument({
      bufferPages: true,
      margin: 50,
    })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf"`)

    // Propagate stream errors cleanly
    doc.on("error", (err) => {
      console.error("PDF stream error:", err)
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate PDF", error: err.message })
      } else {
        res.end()
      }
    })

    // Pipe PDF to response
    doc.pipe(res)

    // Add title
    doc.fontSize(24).font("Helvetica-Bold").fillColor("#000000").text(note.title, { align: "left" })
    doc.moveDown(0.5)

    // Add metadata
    doc.fontSize(10).font("Helvetica").fillColor("#666666")
    doc.text(`Category: ${note.category} | Difficulty: ${note.difficulty} | Chapter: ${note.chapter}`)
    doc.moveDown(0.3)
    doc.text(`Author: ${note.author || "Admin"} | Reading Time: ${note.readingTime || "5 min"}`)
    doc.moveDown(1)

    // Add separator line
    doc.strokeColor("#cccccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.8)

    // Render markdown content with proper formatting
    const safeContent = typeof note.content === "string" ? note.content : ""
    doc.fillColor("#000000")
    renderMarkdownToPDF(doc, safeContent)

    // Add footer
    doc.moveDown(1)
    doc.fontSize(9).fillColor("#999999")
    doc.text(`Generated on ${new Date().toLocaleDateString()} | ${note.title}`, {
      align: "center",
    })

    // Finalize PDF
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
