import HandwrittenPDF from "../models/HandwrittenPDF.js"
import { validatePDF } from "../middleware/validation.js"
import imagekit from "../config/imagekit.js"

/**
 * ==========================================
 * PDF UPLOAD CONTROLLER
 * ==========================================
 * Handles PDF uploads to ImageKit and database storage
 */

// Admin: Upload PDF to ImageKit and create PDF record
export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file provided" })
    }

    const { title, category, level, description, isPremium, totalPages, tags } = req.body

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" })
    }

    // Generate a clean filename
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
    const timestamp = Date.now()
    const filename = `${cleanTitle}-${timestamp}.pdf`
    const folderPath = `/handwritten-pdfs/${cleanTitle}`

    console.log(`[PDF Upload] Uploading PDF to ImageKit: ${filename}`)

    // Upload file to ImageKit
    try {
      const response = await imagekit.upload({
        file: req.file.buffer,
        fileName: filename,
        folder: folderPath,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      })

      console.log(`[PDF Upload] Successfully uploaded to ImageKit`)
      console.log(`[PDF Upload] File ID: ${response.fileId}`)
      console.log(`[PDF Upload] URL: ${response.url}`)

      // Store PDF data in database
      const pdfData = {
        title,
        category: category.trim(),
        level: level || "Beginner",
        pdfUrl: response.url,
        description,
        isPremium: isPremium === "true" || isPremium === true,
        totalPages: totalPages ? Number(totalPages) : 1,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        imageKitFileId: response.fileId,
      }

      const pdf = await HandwrittenPDF.create(pdfData)

      res.status(201).json({
        success: true,
        message: "PDF uploaded successfully",
        pdf,
      })
    } catch (uploadError) {
      console.error(`[PDF Upload] ImageKit upload failed:`, uploadError.message)
      return res.status(500).json({
        message: "Failed to upload PDF to ImageKit",
        error: uploadError.message,
      })
    }
  } catch (error) {
    console.error(`[PDF Upload] Error:`, error.message)
    res.status(500).json({ message: error.message })
  }
}

// Admin: Create PDF (for manual data entry without file)
export const createPDF = async (req, res) => {
  try {
    const { error, value } = validatePDF(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const pdf = await HandwrittenPDF.create(value)

    res.status(201).json({
      success: true,
      message: "PDF created successfully",
      pdf,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Update PDF
export const updatePDF = async (req, res) => {
  try {
    const { error, value } = validatePDF(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const pdf = await HandwrittenPDF.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    })

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    res.status(200).json({
      success: true,
      message: "PDF updated successfully",
      pdf,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Admin: Delete PDF
export const deletePDF = async (req, res) => {
  try {
    const pdf = await HandwrittenPDF.findById(req.params.id)
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    // Delete from ImageKit if fileId exists
    if (pdf.imageKitFileId) {
      try {
        await imagekit.deleteFile(pdf.imageKitFileId)
        console.log(`[PDF Delete] Deleted from ImageKit: ${pdf.imageKitFileId}`)
      } catch (deleteError) {
        console.error(`[PDF Delete] Failed to delete from ImageKit:`, deleteError.message)
        // Continue with database deletion even if ImageKit delete fails
      }
    }

    // Delete from database
    await pdf.deleteOne()

    res.status(200).json({
      success: true,
      message: "PDF deleted successfully",
    })
  } catch (error) {
    console.error(`[PDF Delete] Error:`, error.message)
    res.status(500).json({ message: error.message })
  }
}

/**
 * ==========================================
 * PDF RETRIEVAL CONTROLLERS
 * ==========================================
 * Handles PDF fetching and serving
 */

// User: Get all PDFs (published)
export const getPDFs = async (req, res) => {
  try {
    const { category, level, isPremium } = req.query

    let filter = {}

    if (category) filter.category = category
    if (level) filter.level = level
    if (isPremium === "true") filter.isPremium = true

    const pdfs = await HandwrittenPDF.find(filter)

    res.status(200).json({
      success: true,
      count: pdfs.length,
      pdfs,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get single PDF by ID
export const getPDFById = async (req, res) => {
  try {
    const pdf = await HandwrittenPDF.findById(req.params.id)

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    // Don't increment downloads here - only increment when user actually downloads
    res.status(200).json({
      success: true,
      pdf,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Get PDF direct URL (for iframe/object tag)
export const getPDFUrl = async (req, res) => {
  try {
    const pdf = await HandwrittenPDF.findById(req.params.id)

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    if (!pdf.pdfUrl) {
      return res.status(400).json({ message: "PDF URL not available" })
    }

    res.status(200).json({
      success: true,
      url: pdf.pdfUrl,
      fileId: pdf.imageKitFileId,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Stream PDF bytes via backend (optional)
export const streamPDF = async (req, res) => {
  try {
    const pdf = await HandwrittenPDF.findById(req.params.id)
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    const pdfUrl = pdf.pdfUrl
    if (!pdfUrl) {
      return res.status(400).json({ message: "PDF URL missing" })
    }

    console.log(`[PDF Stream] Streaming PDF from ImageKit: ${pdfUrl}`)

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept")

    try {
      // Fetch PDF from ImageKit
      const response = await fetch(pdfUrl, {
        timeout: 30000,
        headers: {
          "Accept": "application/pdf",
          "User-Agent": "Mozilla/5.0",
        },
      })

      console.log(`[PDF Stream] HTTP ${response.status} from ImageKit`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[PDF Stream] Failed: HTTP ${response.status}`, errorText.substring(0, 500))
        return res.status(response.status).json({
          message: `Failed to fetch PDF: HTTP ${response.status}`,
        })
      }

      const contentLength = response.headers.get("content-length")

      // Set response headers for inline PDF viewing
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", "inline")
      res.setHeader("Cache-Control", "public, max-age=3600")

      if (contentLength) {
        res.setHeader("Content-Length", contentLength)
      }

      // Get PDF buffer
      const buffer = await response.arrayBuffer()
      console.log(`[PDF Stream] Downloaded ${buffer.byteLength} bytes`)

      if (buffer.byteLength === 0) {
        console.error(`[PDF Stream] Downloaded empty PDF file`)
        return res.status(400).json({ message: "PDF file is empty" })
      }

      // Verify PDF signature
      const bufferView = new Uint8Array(buffer)
      const pdfSignature = String.fromCharCode(...bufferView.slice(0, 4))
      if (pdfSignature !== "%PDF") {
        console.error(`[PDF Stream] Invalid PDF signature: ${pdfSignature}`)
        return res.status(400).json({ message: "Invalid PDF file" })
      }

      // Send PDF
      res.send(Buffer.from(buffer))
      console.log(`[PDF Stream] Successfully sent PDF to client`)
    } catch (fetchError) {
      console.error(`[PDF Stream] Fetch error: ${fetchError.message}`)
      if (!res.headersSent) {
        res.status(500).json({ message: `Failed to fetch PDF: ${fetchError.message}` })
      } else {
        res.end()
      }
    }
  } catch (error) {
    console.error(`[PDF Stream] Error: ${error.message}`)
    if (!res.headersSent) {
      res.status(500).json({ message: error.message })
    }
  }
}

// Admin: Get all PDFs (for management)
export const getAdminPDFs = async (req, res) => {
  try {
    const { category, level } = req.query

    let filter = {}

    if (category) filter.category = category
    if (level) filter.level = level

    const pdfs = await HandwrittenPDF.find(filter)

    res.status(200).json({
      success: true,
      count: pdfs.length,
      pdfs,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// User: Track PDF download
export const downloadPDF = async (req, res) => {
  try {
    const pdf = await HandwrittenPDF.findById(req.params.id)

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    // Increment downloads counter
    pdf.downloads = (pdf.downloads || 0) + 1
    await pdf.save()

    res.status(200).json({
      success: true,
      message: "Download tracked",
      downloads: pdf.downloads,
      pdfUrl: pdf.pdfUrl,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
