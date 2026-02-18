// API base URL - update based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

// Utility: Transform PDF URLs for inline browser preview
// Supports both ImageKit direct URLs and backend stream endpoints
export const getPDFViewUrl = (pdfUrl: string): string => {
  if (!pdfUrl) return ""

  let transformedUrl = pdfUrl

  // If this is a backend stream endpoint, don't modify it
  if (transformedUrl.includes('/api/pdfs/') && transformedUrl.includes('/stream')) {
    return transformedUrl
  }

  // ImageKit URLs work directly with proper query parameters
  if (transformedUrl.includes('imagekit.io')) {
    // ImageKit URLs serve PDFs correctly as-is
    // The SDK automatically adds proper Content-Disposition headers
    return transformedUrl
  }

  // Legacy Cloudinary URL handling (if still needed)
  if (transformedUrl.includes('cloudinary.com')) {
    // Check if URL already has .pdf extension
    if (!transformedUrl.endsWith('.pdf') && !transformedUrl.includes('.pdf?')) {
      // Add .pdf before any query parameters
      if (transformedUrl.includes('?')) {
        const [base, query] = transformedUrl.split('?')
        transformedUrl = `${base}.pdf?${query}`
      } else {
        transformedUrl = `${transformedUrl}.pdf`
      }
    }

    // Remove any existing fl_inline or fl_attachment transformations (they don't work with raw)
    transformedUrl = transformedUrl.replace('/fl_inline/', '/').replace('/fl_attachment/', '/')
  }

  return transformedUrl
}

// Utility: Wrap a PDF URL in the pdf.js viewer for robust cross-origin rendering
// This avoids browser plugin quirks and X-Frame-Options issues from third-party hosts
export const getPDFEmbedUrl = (pdfUrl: string): string => {
  const viewUrl = getPDFViewUrl(pdfUrl)
  const encoded = encodeURIComponent(viewUrl)
  // Use locally hosted pdf.js embedded viewer for same-origin rendering
  return `/pdfjs/embedded.html?file=${encoded}`
}

// Build backend stream endpoint URL for a given PDF id
export const getPDFStreamUrl = (id: string): string => {
  return `${API_BASE_URL}/pdfs/${id}/stream`
}

// Get direct PDF URL from ImageKit
export const getPDFDirectUrl = async (id: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}/url`)
    if (!response.ok) throw new Error("Failed to fetch PDF URL")
    const data = await response.json()
    return data.url || ""
  } catch (error) {
    console.error("Error fetching PDF URL:", error)
    return ""
  }
}

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }
    return response.json()
  },

  verifyOtp: async (userId: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, otp }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "OTP verification failed")
    }
    return response.json()
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch profile")
    return response.json()
  },

  // Get Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/auth/google`
  },
}

// Notes API calls
export const notesAPI = {
  // User: Get all published notes
  getPublished: async (filters?: { category?: string; chapter?: string; chapterId?: string; difficulty?: string }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.chapter) params.append("chapter", filters.chapter)
    // Forward chapterId for backend compatibility during migration
    if (filters?.chapterId) params.append("chapterId", filters.chapterId)
    if (filters?.difficulty) params.append("difficulty", filters.difficulty)

    const query = params.toString()
    const url = query ? `${API_BASE_URL}/notes?${query}` : `${API_BASE_URL}/notes`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch notes")
    return response.json()
  },

  // User: Get note by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`)
    if (!response.ok) throw new Error("Failed to fetch note")
    return response.json()
  },

  // User: Get note by slug
  getBySlug: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/notes/slug/${slug}`)
    if (!response.ok) throw new Error("Failed to fetch note")
    return response.json()
  },

  // Admin: Create note
  create: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || error.error || "Failed to create note")
    }
    return response.json()
  },

  // Admin: Update note
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || error.error || "Failed to update note")
    }
    return response.json()
  },

  // Admin: Delete note
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete note")
    return response.json()
  },

  // Admin: Get all notes including drafts
  getAllAdmin: async (token: string, filters?: { category?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.status) params.append("status", filters.status)

    const response = await fetch(`${API_BASE_URL}/notes/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch notes")
    return response.json()
  },

  // User: Download note as PDF
  downloadAsPDF: async (id: string, token?: string) => {
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/notes/${id}/download-pdf`, {
      headers
    })
    if (!response.ok) throw new Error("Failed to generate PDF")
    return response.blob()
  },
}

// Chapters API calls
export const chaptersAPI = {
  // Public: Get all chapters
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/chapters`)
    if (!response.ok) throw new Error("Failed to fetch chapters")
    return response.json()
  },

  // Public: Get chapter by slug
  getBySlug: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/chapters/slug/${slug}`)
    if (!response.ok) throw new Error("Failed to fetch chapter")
    return response.json()
  },

  // Admin: Create chapter
  create: async (token: string, data: { title: string; slug?: string; description?: string; icon?: string; gradient?: string; level?: string; parentId?: string; hasSubChapters?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/chapters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create chapter")
    return response.json()
  },

  // Admin: Delete chapter
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/chapters/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete chapter")
    return response.json()
  },

  // Admin: Update chapter
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/chapters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update chapter")
    return response.json()
  },
}

// Interview Questions API calls
export const interviewAPI = {
  // User/Admin: Get interview meta lists
  getMeta: async () => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/meta`)
    if (!response.ok) throw new Error("Failed to fetch interview meta")
    return response.json()
  },

  // User: Get questions by topic/company/role/difficulty via slug
  getByTypeSlug: async (type: "topic" | "company" | "role" | "difficulty", slug: string) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/${type}/${encodeURIComponent(slug)}`)
    if (!response.ok) throw new Error("Failed to fetch interview questions")
    return response.json()
  },

  // User: Download interview questions as PDF by type/slug (Premium)
  downloadByType: async (type: "topic" | "company" | "role" | "difficulty", slug: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/pdf/${type}/${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Failed to download PDF")
    }
    return response.blob()
  },

  // User: Get questions by role
  getByRole: async (role: string, filters?: { difficulty?: string }) => {
    const params = new URLSearchParams({ role })
    if (filters?.difficulty) params.append("difficulty", filters.difficulty)

    const response = await fetch(`${API_BASE_URL}/interview-questions?${params.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch interview questions")
    return response.json()
  },

  // User: Download interview questions for a role (Premium)
  downloadAsPDF: async (role: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/pdf/${encodeURIComponent(role)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Failed to download PDF")
    }
    return response.blob()
  },

  // User: Get all questions
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/all`)
    if (!response.ok) throw new Error("Failed to fetch interview questions")
    return response.json()
  },

  // User: Get question by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/${id}`)
    if (!response.ok) throw new Error("Failed to fetch question")
    return response.json()
  },

  // Admin: Create question
  create: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create question")
    }
    return response.json()
  },

  // Admin: Update question
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update question")
    return response.json()
  },

  // Admin: Delete question
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/interview-questions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete question")
    return response.json()
  },

  // Admin: Get all questions
  getAllAdmin: async (token: string, filters?: { role?: string; difficulty?: string }) => {
    const params = new URLSearchParams()
    if (filters?.role) params.append("role", filters.role)
    if (filters?.difficulty) params.append("difficulty", filters.difficulty)

    const response = await fetch(`${API_BASE_URL}/interview-questions/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch questions")
    return response.json()
  },
}

// Handwritten PDFs API calls
export const pdfsAPI = {
  // User: Get all PDFs
  getAll: async (filters?: { category?: string; level?: string; isPremium?: boolean }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.level) params.append("level", filters.level)
    if (filters?.isPremium) params.append("isPremium", "true")

    const response = await fetch(`${API_BASE_URL}/pdfs?${params.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch PDFs")
    return response.json()
  },

  // User: Get PDF by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}`)
    if (!response.ok) throw new Error("Failed to fetch PDF")
    return response.json()
  },

  // Admin: Upload PDF file to ImageKit
  upload: async (token: string, file: File, metadata: { title: string; category: string; level?: string; description?: string; isPremium?: boolean; totalPages?: number; tags?: string[] }) => {
    const formData = new FormData()
    formData.append("pdf", file)
    formData.append("title", metadata.title)
    formData.append("category", metadata.category)
    if (metadata.level) formData.append("level", metadata.level)
    if (metadata.description) formData.append("description", metadata.description)
    if (metadata.isPremium !== undefined) formData.append("isPremium", String(metadata.isPremium))
    if (metadata.totalPages) formData.append("totalPages", String(metadata.totalPages))
    if (metadata.tags && metadata.tags.length > 0) {
      metadata.tags.forEach((tag) => formData.append("tags", tag))
    }

    const response = await fetch(`${API_BASE_URL}/pdfs/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to upload PDF")
    }
    return response.json()
  },

  // Admin: Create PDF (manual entry without file)
  create: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/pdfs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create PDF")
    return response.json()
  },

  // Admin: Update PDF
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update PDF")
    return response.json()
  },

  // Admin: Delete PDF
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete PDF")
    return response.json()
  },

  // Admin: Get all PDFs
  getAllAdmin: async (token: string, filters?: { category?: string; level?: string }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.level) params.append("level", filters.level)

    const response = await fetch(`${API_BASE_URL}/pdfs/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch PDFs")
    return response.json()
  },

  // User: Track download
  download: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}/download`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to track download")
    return response.json()
  },
}

// Users API calls (admin and user)
export const usersAPI = {
  // User Dashboard
  getDashboard: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch dashboard")
    return response.json()
  },

  // Save/Unsave Notes
  saveNote: async (token: string, noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/save-note/${noteId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to save note")
    return response.json()
  },

  unsaveNote: async (token: string, noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/save-note/${noteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to unsave note")
    return response.json()
  },

  // Save/Unsave PDFs
  savePDF: async (token: string, pdfId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/save-pdf/${pdfId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to save PDF")
    return response.json()
  },

  unsavePDF: async (token: string, pdfId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/save-pdf/${pdfId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to unsave PDF")
    return response.json()
  },

  // Check saved items
  checkSaved: async (token: string, noteIds?: string[], pdfIds?: string[]) => {
    const response = await fetch(`${API_BASE_URL}/users/check-saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ noteIds, pdfIds }),
    })
    if (!response.ok) throw new Error("Failed to check saved items")
    return response.json()
  },

  // Admin functions
  getAllAdmin: async (token: string, filters?: { role?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.role) params.append("role", filters.role)
    if (filters?.status) params.append("status", filters.status)

    const response = await fetch(`${API_BASE_URL}/users/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch users")
    return response.json()
  },

  getStats: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch stats")
    return response.json()
  },

  // Update profile
  updateProfile: async (token: string, data: { name?: string; avatar?: string }) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update profile")
    return response.json()
  },

  // Upload avatar
  uploadAvatar: async (token: string, file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await fetch(`${API_BASE_URL}/users/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to upload avatar")
    }
    return response.json()
  },
}

export const contactAPI = {
  sendMessage: async (data: { message: string }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/contact/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to send message")
    }
    return response.json()
  },

  sendFeedback: async (
    data: { feedbackType: string; subject: string; details: string },
    token: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/contact/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to send feedback")
    }
    return response.json()
  },
}

// Roadmap API calls
export const roadmapsAPI = {
  // Public: Get all roadmaps
  getAll: async (status?: string) => {
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    const query = params.toString()
    const response = await fetch(`${API_BASE_URL}/roadmaps${query ? `?${query}` : ""}`)
    if (!response.ok) throw new Error("Failed to fetch roadmaps")
    return response.json()
  },

  // Public: Get roadmap by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/${id}`)
    if (!response.ok) throw new Error("Failed to fetch roadmap")
    return response.json()
  },

  // Public: Get nodes for a roadmap
  getNodes: async (roadmapId: string, status?: string) => {
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    const query = params.toString()
    const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/nodes${query ? `?${query}` : ""}`)
    if (!response.ok) throw new Error("Failed to fetch roadmap nodes")
    return response.json()
  },

  // Admin: Create roadmap
  create: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create roadmap")
    return response.json()
  },

  // Admin: Update roadmap
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update roadmap")
    return response.json()
  },

  // Admin: Delete roadmap
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete roadmap")
    return response.json()
  },

  // Admin: Publish all draft roadmaps
  publishDrafts: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/publish-drafts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to publish drafts")
    return response.json()
  },

  // Admin: Create node
  createNode: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/nodes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create node")
    return response.json()
  },

  // Admin: Update node
  updateNode: async (token: string, nodeId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/nodes/${nodeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update node")
    return response.json()
  },

  // Admin: Delete node
  deleteNode: async (token: string, nodeId: string) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/nodes/${nodeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete node")
    return response.json()
  },

  // Admin: Reorder nodes
  reorderNodes: async (
    token: string,
    roadmapId: string,
    nodes: Array<{ id: string; parentId: string | null; order: number }>
  ) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/nodes/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nodes }),
    })
    if (!response.ok) throw new Error("Failed to reorder nodes")
    return response.json()
  },

  // User: Save roadmap
  saveRoadmap: async (token: string, roadmapId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/save-roadmap/${roadmapId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to save roadmap")
    return response.json()
  },

  // User: Unsave roadmap
  unsaveRoadmap: async (token: string, roadmapId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/save-roadmap/${roadmapId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to unsave roadmap")
    return response.json()
  },

  // User: Download roadmap as PDF (Premium)
  downloadAsPDF: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/roadmaps/${id}/download-pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Failed to download roadmap PDF")
    }
    return response.blob()
  },
}

export const subscriptionAPI = {
  createOrder: async (token: string, planType: "monthly" | "yearly" = "monthly") => {
    const response = await fetch(`${API_BASE_URL}/subscription/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ planType }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create subscription order" }))
      const errorMessage = error.message || `Failed to create order (${response.status})`
      throw new Error(errorMessage)
    }
    return response.json()
  },

  verifyPayment: async (token: string, paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
    const response = await fetch(`${API_BASE_URL}/subscription/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Payment verification failed" }))
      const errorMessage = error.message || `Verification failed (${response.status})`
      throw new Error(errorMessage)
    }
    return response.json()
  },

  getStatus: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/subscription/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch subscription status" }))
      const errorMessage = error.message || `Failed to fetch status (${response.status})`
      throw new Error(errorMessage)
    }
    return response.json()
  },
}

export const aiAPI = {
  askDoubt: async (token: string, data: { noteTitle: string; noteContent: string; question: string }) => {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to get AI response" }))
      throw new Error(error.message || "Failed to get AI response")
    }
    return response.json()
  },
}

