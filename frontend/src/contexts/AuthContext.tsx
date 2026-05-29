import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  isPaid: boolean
  subscriptionExpiresAt?: string | null
  aiMessagesUsed?: number
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
  isPaid: boolean
  refreshSubscriptionStatus: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if subscription has expired locally
  const checkSubscriptionExpiry = (currentUser: User | null) => {
    if (!currentUser || !currentUser.isPaid || !currentUser.subscriptionExpiresAt) {
      return currentUser
    }

    const expiryDate = new Date(currentUser.subscriptionExpiresAt)
    if (new Date() > expiryDate) {
      // Subscription has expired, update user state
      return {
        ...currentUser,
        isPaid: false,
        subscriptionExpiresAt: null,
      }
    }
    return currentUser
  }

  // Load token and user from localStorage on mount
  useEffect(() => {
    // Check if there's saved auth data
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedToken !== "null" && savedUser && savedUser !== "null") {
      try {
        const parsedUser = JSON.parse(savedUser)
        const userWithExpiryCheck = checkSubscriptionExpiry(parsedUser)
        
        // Set both state variables together in a batch update
        setToken(savedToken)
        setUser(userWithExpiryCheck)
        
        // Update localStorage if subscription expired
        if (userWithExpiryCheck.isPaid !== parsedUser.isPaid) {
          localStorage.setItem("user", JSON.stringify(userWithExpiryCheck))
        }
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

  // Periodically check subscription expiry every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setUser((currentUser) => {
        if (!currentUser) return currentUser
        const updatedUser = checkSubscriptionExpiry(currentUser)
        
        // Update localStorage if expired
        if (updatedUser.isPaid !== currentUser.isPaid) {
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }
        return updatedUser
      })
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const login = (token: string, user: User) => {
    // Ensure user has a role, default to "user" if missing
    const userWithRole = {
      ...user,
      role: user.role || "user"
    }

    setToken(token)
    setUser(userWithRole)

    // Save to localStorage
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userWithRole))
    localStorage.setItem("isAdmin", userWithRole.role === "admin" ? "true" : "false")
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("isAdmin")
  }

  const refreshSubscriptionStatus = () => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser
      const updatedUser = checkSubscriptionExpiry(currentUser)
      if (updatedUser.isPaid !== currentUser.isPaid) {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
      return updatedUser
    })
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    refreshSubscriptionStatus,
    isAdmin: user?.role === "admin",
    isPaid: user?.isPaid || false,
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
