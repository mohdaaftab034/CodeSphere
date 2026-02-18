import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom"
import { useAuth, AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Loader2 } from "lucide-react"
import HomePage from "./pages/HomePage.tsx"
import NotesPage from "./pages/NotesPage.tsx"
import InterviewPage from "./pages/InterviewPage.tsx"
import InterviewQuestionsPage from "./pages/InterviewQuestionsPage.tsx"
import RoadmapDetailPage from "./pages/RoadmapDetailPage.tsx"
import RoadmapListingPage from "./pages/RoadmapListingPage.tsx"
import SubscriptionPage from "./pages/SubscriptionPage.tsx"
import ContactPage from "./pages/ContactPage.tsx"
import AboutUsPage from "./pages/AboutUsPage.tsx"
import LoginPage from "./pages/LoginPage.tsx"
import AuthCallbackPage from "./pages/AuthCallbackPage.tsx"
import DashboardPage from "./pages/DashboardPage.tsx"
import RoadmapAdminPage from "./pages/RoadmapAdminPage.tsx"
import NoteDetailPage from "./pages/NoteDetailPage.tsx"
import HandwrittenNotesListingPage from "./pages/HandwrittenNotesListingPage.tsx"
import HandwrittenNotePDFPreviewPage from "./pages/HandwrittenNotePDFPreviewPage.tsx"
import PremiumHandwrittenNotesPage from "./pages/PremiumHandwrittenNotesPage.tsx"
import ChapterTopicsPage from "./pages/ChapterTopicsPage.tsx"
import PrivacyPage from "./pages/PrivacyPage.tsx"
import TermsPage from "./pages/TermsPage.tsx"
import FeedbackPage from "./pages/FeedbackPage.tsx"
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx"
import SingleQuestionPage from "./pages/SingleQuestionPage.tsx"
import UserManagementPage from "./pages/UserManagementPage.tsx"
import NotesManagementPage from "./pages/NotesManagementPage.tsx"
import NoteEditorPage from "./pages/NoteEditorPage.tsx"
import InterviewManagementPage from "./pages/InterviewManagementPage.tsx"
import AddInterviewQuestionPage from "./pages/AddInterviewQuestionPage.tsx"
import PDFManagementPage from "./pages/PDFManagementPage.tsx"
import PagesManagementPage from "./pages/PagesManagementPage.tsx"
import SettingsPage from "./pages/SettingsPage.tsx"
import UserProfilePage from "./pages/UserProfilePage.tsx"
import ManageTopicsPage from "./pages/ManageTopicsPage.tsx"
import { Toaster } from "react-hot-toast"
import "./index.css"

// Component that wraps routes and waits for auth to load
function AppRoutes() {
  const { isLoading } = useAuth()
  const location = useLocation()

  const RoleRedirect = () => {
    const { roleId } = useParams()
    return <Navigate to={`/interview-questions/role/${roleId}`} replace />
  }

  // Don't wait for auth loading on auth callback page - it handles its own loading
  if (isLoading && location.pathname !== "/auth/callback") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        <Route path="/notes/:chapterId" element={<ProtectedRoute><ChapterTopicsPage /></ProtectedRoute>} />
        <Route path="/notes/:chapterId/:topicSlug" element={<ProtectedRoute><NoteDetailPage /></ProtectedRoute>} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/interview/:roleId" element={<RoleRedirect />} />
        <Route path="/interview/question/:id" element={<SingleQuestionPage />} />
        <Route path="/interview-questions/company/:companySlug" element={<InterviewQuestionsPage pageType="company" paramKey="companySlug" />} />
        <Route path="/interview-questions/role/:roleSlug" element={<InterviewQuestionsPage pageType="role" paramKey="roleSlug" />} />
        <Route path="/interview-questions/difficulty/:difficultySlug" element={<InterviewQuestionsPage pageType="difficulty" paramKey="difficultySlug" />} />
        <Route path="/interview-questions/:topicSlug" element={<InterviewQuestionsPage pageType="topic" paramKey="topicSlug" />} />

        <Route path="/roadmap" element={<RoadmapListingPage />} />
        <Route path="/roadmap/:id" element={<RoadmapDetailPage />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/handwritten-notes" element={<ProtectedRoute><HandwrittenNotesListingPage /></ProtectedRoute>} />
        <Route path="/handwritten-notes/:id" element={<ProtectedRoute><HandwrittenNotePDFPreviewPage /></ProtectedRoute>} />
        <Route path="/premium-handwritten-notes" element={<ProtectedRoute><PremiumHandwrittenNotesPage /></ProtectedRoute>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/notes/new" element={<ProtectedRoute requiredRole="admin"><NoteEditorPage /></ProtectedRoute>} />
        <Route path="/admin/notes/:id/edit" element={<ProtectedRoute requiredRole="admin"><NoteEditorPage /></ProtectedRoute>} />
        <Route path="/admin/notes" element={<ProtectedRoute requiredRole="admin"><NotesManagementPage /></ProtectedRoute>} />
        <Route path="/admin/topics" element={<ProtectedRoute requiredRole="admin"><ManageTopicsPage /></ProtectedRoute>} />
        <Route path="/admin/interviews/new" element={<ProtectedRoute requiredRole="admin"><AddInterviewQuestionPage /></ProtectedRoute>} />
        <Route path="/admin/interviews/:id/edit" element={<ProtectedRoute requiredRole="admin"><AddInterviewQuestionPage /></ProtectedRoute>} />
        <Route path="/admin/interviews" element={<ProtectedRoute requiredRole="admin"><InterviewManagementPage /></ProtectedRoute>} />
        <Route path="/admin/pdfs" element={<ProtectedRoute requiredRole="admin"><PDFManagementPage /></ProtectedRoute>} />
        <Route path="/admin/roadmaps" element={<ProtectedRoute requiredRole="admin"><RoadmapAdminPage /></ProtectedRoute>} />
        <Route path="/admin/pages" element={<ProtectedRoute requiredRole="admin"><PagesManagementPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><SettingsPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

import { SmoothScroll } from "./components/SmoothScroll.tsx"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll>
          <AppRoutes />
          <Toaster position="top-center" reverseOrder={false} />
        </SmoothScroll>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App