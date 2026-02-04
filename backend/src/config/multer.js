import multer from "multer"

// Use memory storage to avoid saving files to disk
const storage = multer.memoryStorage()

// Filter for PDF and Image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
})

export default upload
