import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Code2, BookOpen, Users } from "lucide-react";
import { useEffect } from "react";
import { FAQSection } from "../components/FAQSection";

const websiteName = import.meta.env.VITE_WEBSITE_NAME;


const features = [
    {
        icon: <BookOpen className="w-6 h-6 text-primary" />,
        title: "Structured Learning",
        description: "Curated paths from beginner to expert in full-stack engineering."
    },
    {
        icon: <Code2 className="w-6 h-6 text-primary" />,
        title: "Real-world Projects",
        description: "Learn by building applications that solve actual problems."
    },
    {
        icon: <Users className="w-6 h-6 text-primary" />,
        title: "Community Driven",
        description: "Join thousands of developers learning and growing together."
    }
];

export default function AboutUsPage() {
    const websiteName = import.meta.env.VITE_WEBSITE_NAME

    useEffect(() => {
        document.title = `About Us | ${websiteName}`
    }, [websiteName])

    return (
        <main className="min-h-screen bg-background text-foreground overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-top-left -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                            <Users className="w-4 h-4" />
                            <span>About Us</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-cal-sans)" }}>
                            Empowering the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Engineers</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            We're more than just a documentation site. We're building the most effective way to learn software engineering, one concept at a time.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission / Features Grid */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <FAQSection />

            <Footer />
        </main>
    );
}
