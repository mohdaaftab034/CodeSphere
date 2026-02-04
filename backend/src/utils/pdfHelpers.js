import PDFDocument from "pdfkit"

/**
 * Helper to render inline markdown with proper formatting
 */
export const renderInlineMarkdown = (doc, text, options = {}) => {
    const { lineGap = 4, continued = false } = options

    // Robust regex for markdown tokens: bold, italic, code, links
    const regex = /(\*\*.*?\*\*|__.*?__|(?<!\*)\*(?!\*).*?\*|(?<!_)_(?!_).*?_|`.*?`|\[.*?\]\(.*?\))/g
    let lastIndex = 0
    let match
    const parts = []

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: "normal", text: text.substring(lastIndex, match.index) })
        }

        const token = match[0]
        if (token.startsWith("**") || token.startsWith("__")) {
            parts.push({ type: "bold", text: token.slice(2, -2) })
        } else if (token.startsWith("*") || token.startsWith("_")) {
            parts.push({ type: "italic", text: token.slice(1, -1) })
        } else if (token.startsWith("`")) {
            parts.push({ type: "code", text: token.slice(1, -1) })
        } else if (token.startsWith("[")) {
            const closeBracket = token.indexOf("]")
            const linkText = token.substring(1, closeBracket)
            const url = token.substring(token.indexOf("(") + 1, token.length - 1)
            parts.push({ type: "link", text: linkText, url })
        }
        lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
        parts.push({ type: "normal", text: text.substring(lastIndex) })
    }

    // If no markdown tokens found, just render the text
    if (parts.length === 0) {
        doc.text(text, { continued, lineGap })
        return
    }

    // Render parts with appropriate styling
    parts.forEach((part, index) => {
        const isLastPart = index === parts.length - 1
        const shouldContinue = !isLastPart || continued

        switch (part.type) {
            case "bold":
                doc.font("Helvetica-Bold").text(part.text, { continued: shouldContinue, lineGap })
                break
            case "italic":
                doc.font("Helvetica-Oblique").text(part.text, { continued: shouldContinue, lineGap })
                break
            case "code":
                doc.fillColor("#d63384").font("Courier").text(part.text, { continued: shouldContinue, lineGap })
                doc.fillColor("#000000").font("Helvetica")
                break
            case "link":
                doc.fillColor("#0066cc").text(part.text, { continued: shouldContinue, lineGap, link: part.url })
                doc.fillColor("#000000")
                break
            case "normal":
            default:
                doc.font("Helvetica").text(part.text, { continued: shouldContinue, lineGap })
        }
    })
}

/**
 * Helper to render markdown content to PDF with proper formatting
 */
export const renderMarkdownToPDF = (doc, markdown, startX = 50) => {
    if (!markdown) return
    const lines = markdown.trim().split("\n")
    const baseTextOptions = { width: doc.page.width - startX - 50, lineGap: 6 }

    let inCodeBlock = false
    let codeBlockContent = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Handle code blocks
        if (line.trim().startsWith("```")) {
            if (inCodeBlock) {
                inCodeBlock = false
                doc.fontSize(9).font("Courier").fillColor("#333333")
                const codeText = codeBlockContent.join("\n")
                const codeWidth = doc.page.width - startX - 70
                const textHeight = doc.heightOfString(codeText, { width: codeWidth, lineGap: 2 })
                const codeBlockHeight = textHeight + 20

                if (doc.y + codeBlockHeight > doc.page.height - 70) {
                    doc.addPage()
                }

                const startY = doc.y
                doc.rect(startX - 5, startY, doc.page.width - startX - 40, codeBlockHeight).fillAndStroke("#f8f8f8", "#d0d0d0")
                doc.fillColor("#333333")
                doc.text(codeText, startX + 10, startY + 10, { width: codeWidth, lineGap: 2 })
                doc.moveDown(1)
                doc.x = startX
                doc.fillColor("#000000")
                doc.font("Helvetica")
                codeBlockContent = []
            } else {
                inCodeBlock = true
            }
            continue
        }

        if (inCodeBlock) {
            codeBlockContent.push(line)
            continue
        }

        if (!line.trim()) {
            doc.moveDown(0.8)
            continue
        }

        // H1 headings
        if (/^# /.test(line)) {
            const headingText = line.replace(/^#+\s+/, "")
            doc.fontSize(22).font("Helvetica-Bold").fillColor("#1a1a1a")
            doc.text(headingText, { ...baseTextOptions })
            doc.moveDown(0.2)
            doc.strokeColor("#0066cc").lineWidth(2).moveTo(startX, doc.y).lineTo(doc.page.width - 50, doc.y).stroke()
            doc.moveDown(1)
            continue
        }

        // H2 headings
        if (/^## /.test(line)) {
            const headingText = line.replace(/^#+\s+/, "")
            doc.fontSize(18).font("Helvetica-Bold").fillColor("#333333")
            doc.text(headingText, { ...baseTextOptions })
            doc.moveDown(0.6)
            continue
        }

        // H3 headings
        if (/^### /.test(line)) {
            const headingText = line.replace(/^#+\s+/, "")
            doc.fontSize(15).font("Helvetica-Bold").fillColor("#444444")
            doc.text(headingText, { ...baseTextOptions })
            doc.moveDown(0.5)
            continue
        }

        // Block quotes
        if (/^>\s/.test(line)) {
            const quoteText = line.replace(/^>\s+/, "")
            const currentStartX = doc.x
            const startY = doc.y
            doc.fontSize(11).font("Helvetica-Oblique").fillColor("#666666")
            const textHeight = doc.heightOfString(quoteText, { width: doc.page.width - startX - 80, lineGap: 4 })
            doc.rect(currentStartX, startY, 3, textHeight + 10).fill("#0066cc")
            doc.fillColor("#666666")
            doc.text(quoteText, currentStartX + 15, startY + 5, { width: doc.page.width - startX - 80, lineGap: 4 })
            doc.moveDown(1)
            doc.x = startX
            continue
        }

        // Unordered lists
        if (/^\s*[-*+]\s/.test(line)) {
            const indentMatch = line.match(/^(\s*)/)
            const indentSize = (indentMatch ? indentMatch[1].length : 0) * 10
            const listItem = line.replace(/^\s*[-*+]\s+/, "")
            const currentY = doc.y
            doc.fontSize(11).font("Helvetica").fillColor("#000000")
            doc.text("• ", startX + indentSize, currentY, { continued: true })
            doc.x = startX + 15 + indentSize
            renderInlineMarkdown(doc, listItem, { lineGap: 6 })
            doc.x = startX
            doc.moveDown(0.2)
            continue
        }

        // Ordered lists
        if (/^\s*\d+\.\s/.test(line)) {
            const match = line.match(/^(\s*)(\d+)\.\s+(.*)/)
            if (match) {
                const indentSize = match[1].length * 10
                const num = match[2]
                const text = match[3]
                const currentY = doc.y
                doc.fontSize(11).font("Helvetica").fillColor("#000000")
                doc.text(`${num}. `, startX + indentSize, currentY, { continued: true })
                doc.x = startX + 20 + indentSize
                renderInlineMarkdown(doc, text, { lineGap: 6 })
                doc.x = startX
                doc.moveDown(0.2)
                continue
            }
        }

        doc.fontSize(11).font("Helvetica").fillColor("#000000")
        renderInlineMarkdown(doc, line, { lineGap: 6 })

        // Avoid trailing moveDown on last line
        if (i < lines.length - 1) {
            doc.moveDown(0.5)
        }
    }
}

/**
 * Helper to finalize PDF pages with numbering and footer
 */
export const finalizePDF = (doc, title, websiteName = "Coding Notes Platform") => {
    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i)

        // Header
        doc.fontSize(8).fillColor("#cccccc").text(
            `${websiteName} | Premium Learning Content`,
            50,
            30,
            { align: "right", width: doc.page.width - 100 }
        )

        // Footer
        doc.fontSize(8).fillColor("#999999").text(
            `Page ${i + 1} of ${range.count} | ${title} | Generated on ${new Date().toLocaleDateString()}`,
            50,
            doc.page.height - 40,
            { align: "center", width: doc.page.width - 100 }
        )
    }
}

/**
 * Standard PDF Page Setup
 */
export const createBasePDF = (title) => {
    const doc = new PDFDocument({
        bufferPages: true,
        margin: 50,
        size: "A4",
    })
    return doc
}
