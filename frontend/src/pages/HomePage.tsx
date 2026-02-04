import { useEffect } from "react"
import { Navbar } from "../components/Navbar"
import { Features } from "../components/Features"
import { FinalCTA } from "../components/FinalCTA"
import { Footer } from "../components/Footer"
import { Hero } from "../components/Hero"
import { MissionSection } from "../components/MissionSection"
import { FAQSection } from "../components/FAQSection"


export default function HomePage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME

  useEffect(() => {
    document.title = `Home | ${websiteName}`
  }, [websiteName])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <MissionSection />
      <Features />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
