import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Eye, FileStack } from "lucide-react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import AdminLayout from "../components/AdminLayout"

const pages = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "contact", label: "Contact Page" },
]

const defaultContent = {
  privacy: "# Privacy Policy\n\nYour privacy is important to us...",
  terms: "# Terms & Conditions\n\nBy using this platform...",
  contact: "# Contact Us\n\nGet in touch with us...",
}

export default function PagesManagementPage() {
  const [selectedPage, setSelectedPage] = useState("privacy")
  const [content, setContent] = useState(defaultContent[selectedPage as keyof typeof defaultContent])

  // Update content when selectedPage changes
  useEffect(() => {
    setContent(defaultContent[selectedPage as keyof typeof defaultContent])
  }, [selectedPage])

  const handlePageChange = (pageId: string) => {
    setSelectedPage(pageId)
  }

  const handleSave = () => {
    alert("Page content saved successfully!")
  }

  const handlePreview = () => {
    alert("Preview would open in new tab")
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileStack className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Pages Management</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handlePreview} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Select Page</h3>
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedPage === page.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {pages.find((p) => p.id === selectedPage)?.label}
                </h2>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Write page content here... Supports markdown."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supports Markdown formatting
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
