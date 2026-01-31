import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Settings as SettingsIcon } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import AdminLayout from "../components/AdminLayout"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "CodeNotes",
    siteDescription: "Learn coding with structured notes",
    contactEmail: "support@codenotes.com",
    maintenanceMode: false,
    allowSignups: true,
    emailNotifications: true,
  })

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              </div>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="h-11"
              />
            </div>
          </motion.div>

          {/* Feature Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 space-y-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Feature Toggles</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable site access for all users
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked: boolean) =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <Label className="text-base">Allow New Signups</Label>
                <p className="text-sm text-muted-foreground">Enable user registration</p>
              </div>
              <Switch
                checked={settings.allowSignups}
                onCheckedChange={(checked: boolean) => setSettings({ ...settings, allowSignups: checked })}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to users
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked: boolean) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
