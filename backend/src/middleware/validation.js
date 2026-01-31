import Joi from "joi"

export const validateNote = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().max(200),
    slug: Joi.string().lowercase().trim(),
    category: Joi.string().required(), // Accept any string; validate dynamically if needed
    chapter: Joi.string().required(),
    chapterId: Joi.string().optional(), // JSON-driven chapter ID for future use
    content: Joi.string().required(), // Markdown content
    difficulty: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .default("Beginner"),
    excerpt: Joi.string().max(500),
    author: Joi.string().default("Admin"),
    readingTime: Joi.string().default("5 min"),
    isPremium: Joi.boolean().default(false),
    status: Joi.string().valid("Draft", "Published").default("Draft"),
  }).unknown(true) // Allow unknown fields for forward compatibility

  return schema.validate(data)
}

export const validateInterviewQuestion = (data) => {
  const schema = Joi.object({
    question: Joi.string().required().max(500),
    description: Joi.string().max(1000),
    answer: Joi.string().required(),
    content: Joi.string(),
    difficulty: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .default("Intermediate"),
    roles: Joi.array()
      .items(
        Joi.string().valid(
          "Software Developer",
          "Web Developer",
          "Frontend Developer",
          "Backend Developer",
          "Full Stack Developer"
        )
      )
      .required(),
    topics: Joi.array().items(Joi.string()),
    codeBlocks: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        language: Joi.string()
          .required()
          .valid("javascript", "typescript", "python", "bash", "sql", "html", "css"),
        code: Joi.string().required(),
      })
    ),
  }).unknown(true)

  return schema.validate(data)
}

export const validatePDF = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().max(200),
    category: Joi.string()
      .required()
      .valid("JavaScript", "React", "MERN", "DSA", "System Design"),
    level: Joi.string().valid("Beginner", "Intermediate", "Advanced").default("Beginner"),
    pdfUrl: Joi.string().required().uri(),
    description: Joi.string().max(500),
    isPremium: Joi.boolean().default(false),
    totalPages: Joi.number().integer().min(1).default(1),
    tags: Joi.array().items(Joi.string()),
  })

  return schema.validate(data)
}

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  })

  return schema.validate(data)
}
