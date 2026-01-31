import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Eye, Upload, FileText as FileTextIcon, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import AdminLayout from "../components/AdminLayout"
import { useQuery } from "../hooks/useQuery"
import { pdfsAPI } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import { fetchChaptersConfig, ChapterConfig } from "../lib/chapters"

interface PDF {
  id: string
  title: string
  category: string
  level: string
  access: "Free" | "Premium"
  pdfUrl: string
  description?: string
  uploadDate: string
}

export default function PDFManagementPage() {
  const { token } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMetadata, setUploadMetadata] = useState({
    title: "",
    category: "",
    level: "Beginner",
    description: "",
    isPremium: false,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [chapters, setChapters] = useState<ChapterConfig[]>([])
  const [loadingChapters, setLoadingChapters] = useState(true)

  // Fetch chapters on mount
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const list = await fetchChaptersConfig()
        setChapters(list)
      } catch (error) {
        console.error("Failed to load chapters:", error)
      } finally {
        setLoadingChapters(false)
      }
    }
    loadChapters()
  }, [])

  // Get unique categories from chapters
  const categories = Array.from(new Set(chapters.filter(ch => !ch.parentId).map(ch => ch.name))).sort()

  const fetchPdfs = useCallback(() => pdfsAPI.getAllAdmin(token || ""), [token])
  const { data: pdfsResponse, isLoading, error, refetch } = useQuery(fetchPdfs, {
    enabled: Boolean(token),
  })

  const pdfs: PDF[] = useMemo(() => {
    const list = pdfsResponse?.data || pdfsResponse?.pdfs || []
    return list.map((pdf: any) => ({
      id: pdf._id || pdf.id,
      title: pdf.title,
      category: pdf.category || "",
      level: pdf.level || pdf.difficulty || "",
      access: pdf.isPremium ? "Premium" : "Free",
      pdfUrl: pdf.pdfUrl,
      description: pdf.description,
      uploadDate: pdf.uploadDate || pdf.createdAt || "",
    }))
  }, [pdfsResponse])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this PDF?")) return
    try {
      await pdfsAPI.delete(token || "", id)
      refetch()
    } catch (err) {
      console.error("Failed to delete PDF", err)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File size must be less than 50MB")
      return
    }
    setSelectedFile(file)
    setUploadError(null)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadMetadata.title || !uploadMetadata.category) {
      setUploadError("Please fill all required fields")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      await pdfsAPI.upload(token || "", selectedFile, uploadMetadata)
      setSelectedFile(null)
      setUploadMetadata({
        title: "",
        category: "JavaScript",
        level: "Beginner",
        description: "",
        isPremium: false,
      })
      refetch()
    } catch (err: any) {
      setUploadError(err.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleViewPDF = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank")
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileTextIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Handwritten PDFs</h1>
                  <p className="text-sm text-muted-foreground">{pdfs.length} PDFs uploaded</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Upload PDF Notes</h2>

              {/* File Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openFilePicker()
                  }
                }}
                role="button"
                tabIndex={0}
                className={`p-12 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer mb-6 ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Upload PDF File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button onClick={(e) => { e.stopPropagation(); openFilePicker() }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Select PDF File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Supported format: PDF (Max 50MB)</p>
              </div>

              {/* File Selected */}
              {selectedFile && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-primary/20 rounded"
                  >
                    <X className="w-5 h-5 text-primary" />
                  </button>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              {/* Upload Metadata Form */}
              {selectedFile && (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={uploadMetadata.title}
                        onChange={(e) =>
                          setUploadMetadata({ ...uploadMetadata, title: e.target.value })
                        }
                        placeholder="e.g., JavaScript Fundamentals"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Category <span className="text-destructive">*</span>
                      </label>
                      {loadingChapters ? (
                        <div className="w-full px-4 py-2 bg-background border border-border rounded-lg text-muted-foreground text-sm">
                          Loading categories...
                        </div>
                      ) : (
                        <select
                          value={uploadMetadata.category}
                          onChange={(e) =>
                            setUploadMetadata({
                              ...uploadMetadata,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Level
                      </label>
                      <select
                        value={uploadMetadata.level}
                        onChange={(e) =>
                          setUploadMetadata({ ...uploadMetadata, level: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Access
                      </label>
                      <select
                        value={uploadMetadata.isPremium ? "Premium" : "Free"}
                        onChange={(e) =>
                          setUploadMetadata({
                            ...uploadMetadata,
                            isPremium: e.target.value === "Premium",
                          })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Free">Free</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={uploadMetadata.description}
                      onChange={(e) =>
                        setUploadMetadata({
                          ...uploadMetadata,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the PDF content"
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload PDF
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* PDFs Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Failed to load PDFs.</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No PDFs uploaded yet.</p>
              <Button variant="outline" onClick={() => refetch()} className="bg-transparent">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map((pdf, index) => (
                <motion.div
                  key={pdf.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center">
                    <FileTextIcon className="w-16 h-16 text-primary/50" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={pdf.access === "Premium" ? "default" : "secondary"}>
                        {pdf.access}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">{pdf.title}</h3>

                    <div className="space-y-1 mb-4">
                      <p className="text-sm text-muted-foreground">Category: {pdf.category}</p>
                      <p className="text-sm text-muted-foreground">Level: {pdf.level}</p>
                      {pdf.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{pdf.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {pdf.uploadDate ? new Date(pdf.uploadDate).toLocaleDateString() : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewPDF(pdf.pdfUrl)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <button
                        onClick={() => handleDelete(pdf.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
