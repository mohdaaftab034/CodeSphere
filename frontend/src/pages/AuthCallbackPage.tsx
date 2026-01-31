import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Parse URL parameters
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")
      const userStr = params.get("user")
      const errorMsg = params.get("error")

      if (errorMsg) {
        setError(decodeURIComponent(errorMsg))
        setTimeout(() => {
          navigate("/login")
        }, 3000)
        return
      }

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr))
          
          console.log("✅ Received from OAuth callback:", { token: token.substring(0, 20) + "...", user })
          
          // Call login to update the context state AND localStorage
          login(token, user)
          
          console.log("✅ Auth context and localStorage updated")
          
          // Redirect to appropriate page
          setTimeout(() => {
            // Navigate based on user role
            if (user.role === "admin") {
              navigate("/admin/dashboard")
            } else {
              navigate("/")
            }
          }, 0)
        } catch (err) {
          console.error("❌ Error parsing user data:", err)
          setError("Failed to complete authentication")
          setTimeout(() => {
            navigate("/login")
          }, 3000)
        }
      } else {
        setError("Invalid authentication response")
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate, login])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-destructive text-lg font-semibold">
              {error}
            </div>
            <p className="text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Completing sign in...</p>
            <p className="text-muted-foreground">Please wait</p>
          </div>
        )}
      </div>
    </div>
  )
}
