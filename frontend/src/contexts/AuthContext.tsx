import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  authProvider?: "local" | "google"
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token and user from localStorage on mount
  useEffect(() => {
    // Check if there's saved auth data
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log("✅ Loaded user from localStorage:", parsedUser)
        // Set both state variables together in a batch update
        setToken(savedToken)
        setUser(parsedUser)
      } catch (err) {
        console.error("❌ Failed to parse stored user:", err)
        // Clear invalid localStorage
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("isAdmin")
      }
    }

    // Always complete loading after reading localStorage
    // This happens synchronously before the component renders again
    setIsLoading(false)
  }, [])

  const login = (token: string, user: User) => {
    console.log("🔐 Logging in user:", user)
    setToken(token)
    setUser(user)

    // Save to localStorage
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("isAdmin", user.role === "admin" ? "true" : "false")
  }

  const logout = () => {
    console.log("🚪 Logging out user")
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("isAdmin")
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
