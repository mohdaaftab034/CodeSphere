import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Code2, BookOpen, Users, HelpCircle, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const websiteName = import.meta.env.VITE_WEBSITE_NAME;

const faqs = [
    {
        question: `What is ${websiteName}?`,
        answer: "We are a comprehensive learning hub designed for developers. We provide high-quality, structured notes, interview preparation materials, and roadmaps to help you master full-stack development and system design."
    },
    {
        question: "Are the notes free to access?",
        answer: "Yes! We believe in democratizing education. Most of our core content, including chapter notes and basic interview questions, is completely free for everyone."
    },
    {
        question: "How is this different from other tutorials?",
        answer: "Unlike scattered tutorials, we offer a structured, curriculum-based approach. Our content is curated by industry experts and focuses on 'Architecting' your understanding rather than just copying code."
    },
    {
        question: "Can I contribute to the notes?",
        answer: "Absolutely! We trust our community. You can suggest edits or submit new topics through our community channels or GitHub repository."
    },
    {
        question: "Do you offer mentorship?",
        answer: "Yes, we have a Premium plan that includes 1-on-1 mentorship sessions with senior engineers to guide your career path."
    }
];

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
    const [openIndex, setOpenIndex] = useState<number | null>(0);

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

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-secondary/30 relative">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                            <HelpCircle className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-cal-sans)" }}>
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Everything you need to know about the platform.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card border border-border rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/50 transition-colors"
                                >
                                    <span className="font-semibold text-lg">{faq.question}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openIndex === index ? "rotate-180 text-primary" : ""
                                            }`}
                                    />
                                </button>
                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-transparent">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10" />
            </section>

            <Footer />
        </main>
    );
}
