import { motion } from "framer-motion";
import { BookOpen, Code2, Users } from "lucide-react";

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

export function MissionSection() {
    return (
        <section className="py-20 px-6 bg-blue-50/10 dark:bg-blue-950/10 border-b border-blue-100/10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-blue-950 dark:text-blue-50"
                        style={{ fontFamily: "var(--font-cal-sans)" }}
                    >
                        Empowering the Next Generation of <span className="text-primary">Engineers</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        We're more than just a documentation site. We're building the most effective way to learn software engineering, one concept at a time.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-blue-100 dark:border-blue-900/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-blue-950 dark:text-blue-50">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
