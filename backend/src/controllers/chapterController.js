import Chapter from "../models/Chapter.js"
import Note from "../models/Note.js"
import { createSlug } from "../utils/helpers.js"

export const createChapter = async (req, res) => {
  try {
    const { title, slug, description, icon, gradient, level, parentId, hasSubChapters, navPath } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Chapter title is required" })
    }

    const finalSlug = slug?.trim() || title.toLowerCase().replace(/\s+/g, '-') // Use hyphens for slugs, standard practice

    const existing = await Chapter.findOne({ slug: finalSlug })
    if (existing) {
      return res.status(400).json({ message: "Chapter slug already exists" })
    }

    const chapter = await Chapter.create({
      title: title.trim(),
      slug: finalSlug,
      description: description || "",
      icon: icon || "BookOpen",
      gradient: gradient || "from-gray-500/80 to-gray-600/80",
      level: level || "Intermediate",
      parentId: (parentId && parentId.trim() !== "") ? parentId : null,
      hasSubChapters: hasSubChapters || false,
      navPath: navPath || ""
    })

    res.status(201).json({ success: true, chapter })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getChapters = async (_req, res) => {
  try {
    const chapters = await Chapter.find({}).sort({ title: 1 })

    // Aggregate topic counts by chapter title
    const counts = await Note.aggregate([
      { $match: { status: "Published" } },
      { $group: { _id: "$chapter", count: { $sum: 1 } } },
    ])
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]))

    const enriched = chapters.map((ch) => ({
      _id: ch._id,
      id: ch.slug,
      name: ch.title,
      slug: ch.slug,
      title: ch.title,
      description: ch.description,
      icon: ch.icon,
      gradient: ch.gradient,
      level: ch.level,
      parentId: ch.parentId,
      hasSubChapters: ch.hasSubChapters,
      navPath: ch.navPath || "",
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
      topicCount: countMap[ch.title] || 0,
    }))

    res.status(200).json({ success: true, count: enriched.length, chapters: enriched })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getChapterBySlug = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ slug: req.params.slug })
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" })
    }
    res.status(200).json({ success: true, chapter })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateChapter = async (req, res) => {
  try {
    const { title, description, icon, gradient, slug, level, parentId, hasSubChapters, navPath } = req.body
    const update = {}
    if (title) update.title = title
    if (description !== undefined) update.description = description
    if (icon) update.icon = icon
    if (gradient) update.gradient = gradient
    if (slug) update.slug = slug
    if (level) update.level = level
    if (parentId !== undefined) update.parentId = (parentId && parentId.trim() !== "") ? parentId : null
    if (hasSubChapters !== undefined) update.hasSubChapters = hasSubChapters
    if (navPath !== undefined) update.navPath = navPath

    const chapter = await Chapter.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" })
    }
    res.status(200).json({ success: true, chapter })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id)
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" })
    }
    res.status(200).json({ success: true, message: "Chapter deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
