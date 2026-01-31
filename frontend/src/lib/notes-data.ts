'use client'

export interface NoteSection {
  type: "text" | "code" | "tip" | "warning"
  title?: string
  content: string
  language?: string
}

export interface Note {
  id: string
  title: string
  description: string
  category: string
  chapter: string
  difficulty: "beginner" | "intermediate" | "advanced"
  sections: NoteSection[]
  relatedNotes: string[]
}

// Minimal subset of notes to enable routing; extend as needed
export const notesData: Record<string, Note> = {
  "js-variables": {
    id: "js-variables",
    title: "Variables & Data Types",
    description: "Understanding var, let, const and primitive vs reference types in JavaScript.",
    category: "javascript",
    chapter: "Basics",
    difficulty: "beginner",
    sections: [
      {
        type: "text",
        title: "Introduction",
        content:
          "Variables are containers for storing data values. JavaScript has three ways to declare variables: var, let, and const. Understanding the differences between them is crucial for writing clean, bug-free code.",
      },
      {
        type: "code",
        title: "Variable Declarations",
        language: "javascript",
        content:
          `// var - function scoped, can be redeclared\nvar name = "John";\nvar name = "Jane"; // No error\n\n// let - block scoped, cannot be redeclared\nlet age = 25;\n// let age = 30; // Error: already declared\n\n// const - block scoped, cannot be reassigned\nconst PI = 3.14159;\n// PI = 3.14; // Error: cannot reassign`,
      },
    ],
    relatedNotes: ["js-functions", "js-arrays"],
  },
  "js-functions": {
    id: "js-functions",
    title: "Functions & Scope",
    description: "Function declarations, expressions, arrow functions, and scope chain.",
    category: "javascript",
    chapter: "Basics",
    difficulty: "beginner",
    sections: [
      {
        type: "text",
        title: "Introduction",
        content:
          "Functions are reusable blocks of code that perform specific tasks. JavaScript offers multiple ways to define functions, each with its own use cases and behaviors.",
      },
    ],
    relatedNotes: ["js-variables", "js-closures"],
  },
}

export function getRelatedNotes(ids: string[]): Note[] {
  return ids.map((id) => notesData[id]).filter(Boolean) as Note[]
}

export function getNoteById(id: string): Note | undefined {
  return notesData[id]
}
