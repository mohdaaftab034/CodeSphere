import { useEffect } from "react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { CategoryCards } from "../components/CategoryCards"
import { NotesListing } from "../components/NotesListing"
import { useSearchParams } from "react-router-dom"

export default function NotesPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const [searchParams] = useSearchParams()
  const chapterParam = searchParams.get("chapter")

  useEffect(() => {
    document.title = `All Notes | ${websiteName}`
  }, [websiteName])

  // Using chapters-first flow; show chapter topics when a chapter slug is provided
  const validChapterSlug = chapterParam || null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Show category cards if no chapter selected; otherwise show topics for that chapter */}
      {!validChapterSlug ? (
        <>
          <section className="pt-24 pb-8 px-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-cal-sans)" }}>
                All Chapters
              </h1>
              <p className="text-muted-foreground">Pick a chapter to explore topic-wise notes.</p>
            </div>
          </section>
          <CategoryCards />
        </>
      ) : (
        <NotesListing initialChapterSlug={validChapterSlug} />
      )}
      <Footer />
    </div>
  )
}
