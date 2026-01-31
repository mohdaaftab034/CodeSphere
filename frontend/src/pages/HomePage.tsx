

import { Navbar } from "../components/Navbar"
import { CategoryCards } from "../components/CategoryCards"
import { Features } from "../components/Features"
import { FinalCTA } from "../components/FinalCTA"
import { Footer } from "../components/Footer"
import { Hero } from "../components/Hero"


export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <CategoryCards />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  )
}
