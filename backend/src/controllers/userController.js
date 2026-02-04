import User from "../models/User.js"
import Note from "../models/Note.js"
import InterviewQuestion from "../models/InterviewQuestion.js"
import HandwrittenPDF from "../models/HandwrittenPDF.js"
import Roadmap from "../models/Roadmap.js"
import imagekit from "../config/imagekit.js"

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/all
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query

    const filter = {}
    if (role) filter.role = role
    // Add more filters as needed

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get dashboard stats (Admin only)
// @route   GET /api/users/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts from all collections
    const [totalUsers, totalNotes, totalQuestions, totalPDFs] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      InterviewQuestion.countDocuments(),
      HandwrittenPDF.countDocuments(),
    ])

    // Calculate growth rate (comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const [recentUsers, previousUsers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      }),
    ])

    const growthRate = previousUsers > 0
      ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
      : recentUsers > 0 ? 100 : 0

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
        totalQuestions,
        totalPDFs,
        growthRate: growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`,
        recentUsers,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user (Admin only)
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Save a note
// @route   POST /api/users/save-note/:noteId
// @access  Private
export const saveNote = async (req, res) => {
  try {
    const { noteId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if note exists
    const note = await Note.findById(noteId)
    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    // Check if already saved (compare as strings)
    if (user.savedNotes.some(id => id.toString() === noteId)) {
      return res.status(400).json({ message: "Note already saved" })
    }

    user.savedNotes.push(noteId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Note saved successfully",
      savedNotes: user.savedNotes,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Unsave a note
// @route   DELETE /api/users/save-note/:noteId
// @access  Private
export const unsaveNote = async (req, res) => {
  try {
    const { noteId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.savedNotes = user.savedNotes.filter(id => id.toString() !== noteId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Note unsaved successfully",
      savedNotes: user.savedNotes,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Save a PDF
// @route   POST /api/users/save-pdf/:pdfId
// @access  Private
export const savePDF = async (req, res) => {
  try {
    const { pdfId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if PDF exists
    const pdf = await HandwrittenPDF.findById(pdfId)
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" })
    }

    // Check if already saved (compare as strings)
    if (user.savedPDFs.some(id => id.toString() === pdfId)) {
      return res.status(400).json({ message: "PDF already saved" })
    }

    user.savedPDFs.push(pdfId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "PDF saved successfully",
      savedPDFs: user.savedPDFs,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Unsave a PDF
// @route   DELETE /api/users/save-pdf/:pdfId
// @access  Private
export const unsavePDF = async (req, res) => {
  try {
    const { pdfId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.savedPDFs = user.savedPDFs.filter(id => id.toString() !== pdfId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "PDF unsaved successfully",
      savedPDFs: user.savedPDFs,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Save a roadmap
// @route   POST /api/users/save-roadmap/:roadmapId
// @access  Private
export const saveRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if roadmap exists
    const roadmap = await Roadmap.findById(roadmapId)
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" })
    }

    // Check if already saved (compare as strings)
    if (user.savedRoadmaps.some(id => id.toString() === roadmapId)) {
      return res.status(400).json({ message: "Roadmap already saved" })
    }

    user.savedRoadmaps.push(roadmapId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Roadmap saved successfully",
      savedRoadmaps: user.savedRoadmaps,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Unsave a roadmap
// @route   DELETE /api/users/save-roadmap/:roadmapId
// @access  Private
export const unsaveRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.savedRoadmaps = user.savedRoadmaps.filter(id => id.toString() !== roadmapId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Roadmap unsaved successfully",
      savedRoadmaps: user.savedRoadmaps,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user's saved items for dashboard
// @route   GET /api/users/dashboard
// @access  Private
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)
      .populate({
        path: 'savedNotes',
        select: 'title category difficulty tags createdAt status'
      })
      .populate({
        path: 'savedPDFs',
        select: 'title category level description totalPages downloads createdAt'
      })
      .populate({
        path: 'savedRoadmaps',
        select: 'title slug description icon color status createdAt'
      })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        savedNotes: user.savedNotes,
        savedPDFs: user.savedPDFs,
        savedRoadmaps: user.savedRoadmaps,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Check if items are saved
// @route   POST /api/users/check-saved
// @access  Private
export const checkSavedItems = async (req, res) => {
  try {
    const userId = req.user._id
    const { noteIds, pdfIds } = req.body

    const user = await User.findById(userId).select('savedNotes savedPDFs')
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const savedNotesMap = {}
    const savedPDFsMap = {}

    if (noteIds && Array.isArray(noteIds)) {
      noteIds.forEach(id => {
        savedNotesMap[id] = user.savedNotes.some(savedId => savedId.toString() === id)
      })
    }

    if (pdfIds && Array.isArray(pdfIds)) {
      pdfIds.forEach(id => {
        savedPDFsMap[id] = user.savedPDFs.some(savedId => savedId.toString() === id)
      })
    }

    res.status(200).json({
      success: true,
      savedNotes: savedNotesMap,
      savedPDFs: savedPDFsMap,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, avatar } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (name) user.name = name
    if (avatar) user.avatar = avatar

    const updatedUser = await user.save()

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload user avatar
// @route   POST /api/users/profile/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" })
    }

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `avatar-${req.user._id}-${Date.now()}`,
      folder: "/avatars",
    })

    const user = await User.findById(req.user._id)
    if (user) {
      user.avatar = result.url
      await user.save()
    }

    res.status(200).json({
      success: true,
      data: {
        avatar: result.url,
        fileId: result.fileId,
      },
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    res.status(500).json({ message: error.message || "Avatar upload failed" })
  }
}
