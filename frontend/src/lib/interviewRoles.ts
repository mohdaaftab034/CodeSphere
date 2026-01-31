import { Code2, Atom, Layers, Briefcase, Trophy } from "lucide-react"

export const interviewRoles = [
  {
    id: "software-developer",
    name: "Software Developer",
    description: "General software development covering data structures, algorithms, and system design",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    topics: ["javascript", "react", "dsa", "system-design"],
  },
  {
    id: "web-developer",
    name: "Web Developer",
    description: "Focus on frontend and backend web technologies",
    icon: Atom,
    color: "from-violet-500 to-purple-500",
    topics: ["javascript", "react", "mern", "web-fundamentals"],
  },
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    description: "User interface development with modern frameworks and tools",
    icon: Layers,
    color: "from-sky-500 to-blue-500",
    topics: ["javascript", "react", "css", "performance"],
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    description: "Server-side development, databases, and API design",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-500",
    topics: ["node", "databases", "api-design", "system-design"],
  },
  {
    id: "fullstack-developer",
    name: "Full Stack Developer",
    description: "End-to-end development covering frontend, backend, and deployment",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    topics: ["javascript", "react", "mern", "system-design", "devops"],
  },
]
