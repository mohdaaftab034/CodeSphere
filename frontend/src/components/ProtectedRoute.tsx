import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
}

export const ProtectedRoute = ({ children, requiredRole = "user" }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
