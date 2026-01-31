export interface HandwrittenNote {
  id: string
  title: string
  subject: string
  description: string
  category: "javascript" | "react" | "mern" | "interview" | "dsa"
  difficulty: "beginner" | "intermediate" | "advanced"
  totalPages: number
  tags: string[]
  thumbnail: string
  pdfUrl: string
  isPremium: boolean
  downloadCount: number
  savedCount: number
  createdDate: string
}

export const handwrittenNotesData: HandwrittenNote[] = [
  {
    id: "hw-js-01",
    title: "JavaScript Fundamentals",
    subject: "Variables, Data Types & Scope",
    description: "Comprehensive handwritten notes covering var, let, const, primitive types, and lexical scope with visual examples.",
    category: "javascript",
    difficulty: "beginner",
    totalPages: 12,
    tags: ["Exam", "Revision", "Basics"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/js-fundamentals.pdf",
    isPremium: false,
    downloadCount: 1240,
    savedCount: 856,
    createdDate: "2024-12-01",
  },
  {
    id: "hw-js-02",
    title: "Closures & Higher-Order Functions",
    subject: "Advanced JavaScript Concepts",
    description: "Detailed handwritten explanations of closures with real-world examples and interview patterns.",
    category: "javascript",
    difficulty: "advanced",
    totalPages: 15,
    tags: ["Interview", "Advanced", "Patterns"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/js-closures.pdf",
    isPremium: true,
    downloadCount: 320,
    savedCount: 280,
    createdDate: "2024-12-05",
  },
  {
    id: "hw-react-01",
    title: "React Hooks Deep Dive",
    subject: "useState, useEffect, useContext, Custom Hooks",
    description: "Handwritten guide to React Hooks with visual flow diagrams and common pitfalls to avoid.",
    category: "react",
    difficulty: "intermediate",
    totalPages: 18,
    tags: ["Interview", "Revision", "Hooks"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/react-hooks.pdf",
    isPremium: true,
    downloadCount: 890,
    savedCount: 650,
    createdDate: "2024-11-28",
  },
  {
    id: "hw-react-02",
    title: "Component Patterns & Performance",
    subject: "Render Props, HOC, Memoization",
    description: "Neat handwritten notes on React design patterns and optimization techniques with code examples.",
    category: "react",
    difficulty: "advanced",
    totalPages: 16,
    tags: ["Interview", "Advanced", "Performance"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/react-patterns.pdf",
    isPremium: true,
    downloadCount: 450,
    savedCount: 380,
    createdDate: "2024-11-25",
  },
  {
    id: "hw-mern-01",
    title: "Full Stack MERN Setup",
    subject: "MongoDB, Express, React, Node Setup & Architecture",
    description: "Complete handwritten walkthrough of setting up a MERN application with database design.",
    category: "mern",
    difficulty: "intermediate",
    totalPages: 20,
    tags: ["Setup", "Revision", "Full-Stack"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/mern-setup.pdf",
    isPremium: false,
    downloadCount: 670,
    savedCount: 510,
    createdDate: "2024-11-20",
  },
  {
    id: "hw-interview-01",
    title: "Array Interview Questions",
    subject: "Two Sum, Sliding Window, Subarray Problems",
    description: "Handwritten solutions to top 20 array interview problems with multiple approaches.",
    category: "interview",
    difficulty: "intermediate",
    totalPages: 22,
    tags: ["Interview", "DSA", "Coding"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/array-interview.pdf",
    isPremium: false,
    downloadCount: 1890,
    savedCount: 1420,
    createdDate: "2024-11-15",
  },
  {
    id: "hw-interview-02",
    title: "System Design Fundamentals",
    subject: "Scalability, Load Balancing, Caching Strategies",
    description: "Premium handwritten guide to system design interviews with architecture diagrams.",
    category: "interview",
    difficulty: "advanced",
    totalPages: 25,
    tags: ["Interview", "System Design", "Architecture"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/system-design.pdf",
    isPremium: true,
    downloadCount: 520,
    savedCount: 410,
    createdDate: "2024-11-10",
  },
  {
    id: "hw-dsa-01",
    title: "Binary Trees Complete Guide",
    subject: "Traversals, BST, Balanced Trees, Common Patterns",
    description: "Comprehensive handwritten notes on binary trees with visual representations and code.",
    category: "dsa",
    difficulty: "intermediate",
    totalPages: 18,
    tags: ["DSA", "Interview", "Trees"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/binary-trees.pdf",
    isPremium: false,
    downloadCount: 980,
    savedCount: 720,
    createdDate: "2024-11-05",
  },
  {
    id: "hw-dsa-02",
    title: "Dynamic Programming Mastery",
    subject: "DP Patterns, Memoization, Optimization",
    description: "Premium handwritten DP guide with step-by-step problem-solving approach.",
    category: "dsa",
    difficulty: "advanced",
    totalPages: 24,
    tags: ["DSA", "Interview", "Advanced"],
    thumbnail: "/api/placeholder/200/260",
    pdfUrl: "/pdfs/dynamic-programming.pdf",
    isPremium: true,
    downloadCount: 610,
    savedCount: 480,
    createdDate: "2024-10-30",
  },
]

export function getHandwrittenNoteById(id: string): HandwrittenNote | undefined {
  return handwrittenNotesData.find((note) => note.id === id)
}

export function getHandwrittenNotesByCategory(category: string): HandwrittenNote[] {
  if (category === "all") return handwrittenNotesData
  return handwrittenNotesData.filter((note) => note.category === category)
}

export function getPremiumHandwrittenNotes(): HandwrittenNote[] {
  return handwrittenNotesData.filter((note) => note.isPremium)
}

export function getFreeHandwrittenNotes(): HandwrittenNote[] {
  return handwrittenNotesData.filter((note) => !note.isPremium)
}
