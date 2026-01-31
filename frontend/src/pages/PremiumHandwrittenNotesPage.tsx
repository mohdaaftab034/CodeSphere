import { motion } from "framer-motion"
import { Lock, Check, Star, Download, ArrowRight, BookOpen } from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { handwrittenNotesData } from "../lib/handwritten-notes-data"

const premiumNotes = handwrittenNotesData.filter((note) => note.isPremium)
const freeNotes = handwrittenNotesData.filter((note) => !note.isPremium)

export default function PremiumHandwrittenNotesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-40" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-8">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Premium Handwritten Notes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-cal-sans)" }}>
              Premium Study Materials for Success
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Unlock exclusive handwritten notes by expert developers. Comprehensive, exam-ready, and interview-focused content designed for serious learners.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90 rounded-xl px-8 h-12 text-base font-medium shadow-lg shadow-amber-500/30">
                <Link to="/pricing">
                  Unlock Premium
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl px-8 h-12 text-base font-medium bg-transparent"
              >
                <Link to="/handwritten-notes">
                  <BookOpen className="mr-2 w-4 h-4" />
                  Browse All Notes
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Exclusive Content",
                description: "Access premium handwritten notes not available in the free section.",
              },
              {
                icon: Download,
                title: "Instant Downloads",
                description: "Download high-quality PDFs immediately after unlocking premium.",
              },
              {
                icon: Star,
                title: "Exam Ready",
                description: "Notes written by experienced developers and verified by experts.",
              },
              {
                icon: Check,
                title: "Interview Focused",
                description: "Content optimized for technical interviews and assessments.",
              },
              {
                icon: BookOpen,
                title: "Complete Coverage",
                description: "Comprehensive topics from basics to advanced concepts.",
              },
              {
                icon: Star,
                title: "Priority Updates",
                description: "Get the latest updates and new premium notes first.",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-all"
                >
                  <div className="p-3 rounded-lg bg-amber-100/20 w-fit mb-4">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Premium Notes Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
              {premiumNotes.length} Premium Notes Available
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unlock all premium handwritten notes with a single subscription.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative"
              >
                <div className="rounded-2xl overflow-hidden bg-white border border-border hover:shadow-lg transition-all duration-300">
                  {/* Locked Overlay */}
                  <div className="relative h-40 bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="relative z-10 text-center">
                      <Lock className="w-12 h-12 text-white mx-auto mb-2" />
                      <p className="text-white font-medium">Premium</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-1">{note.subject}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 py-3 border-t border-border">
                      <span>{note.totalPages} pages</span>
                      <span>•</span>
                      <span className="capitalize">{note.difficulty}</span>
                    </div>

                    {/* CTA */}
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90 rounded-lg h-10">
                      <Lock className="w-4 h-4 mr-2" />
                      Unlock Note
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
              Free vs Premium
            </h2>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-foreground">Free</th>
                  <th className="text-center px-6 py-4 font-semibold text-foreground">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Free Notes Access", free: true, premium: true },
                  { feature: "Premium Notes", free: false, premium: true },
                  { feature: "PDF Download", free: true, premium: true },
                  { feature: "Offline Reading", free: true, premium: true },
                  { feature: "Advanced Search", free: false, premium: true },
                  { feature: "Priority Support", free: false, premium: true },
                  { feature: "Ad-Free Experience", free: false, premium: true },
                  { feature: "Exclusive Updates", free: false, premium: true },
                ].map((item, index) => (
                  <tr key={item.feature} className={index % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {item.free ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.premium ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Free Notes Preview */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
              {freeNotes.length} Free Notes Available
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Start with our free collection of handwritten notes while you explore premium content.
            </p>
            <Button asChild variant="outline" className="bg-transparent rounded-lg">
              <Link to="/handwritten-notes">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Free Notes
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-200/50 p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
              Ready to Unlock Premium?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get instant access to all premium handwritten notes, plus exclusive content and priority updates.
            </p>
            <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90 rounded-xl px-8 h-12 text-base font-medium shadow-lg shadow-amber-500/30">
              <Link to="/pricing">
                View Pricing
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
