import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { useRef } from "react";
import {
  Search,
  Filter,
  Bookmark,
  Code,
  BookMarked,
  Zap,
  MousePointer2,
} from "lucide-react";

const features = [
  {
    title: "Powerful Search",
    description:
      "Find any concept instantly. Filter by topic, chapter, or difficulty level with millisecond latency.",
    icon: Search,
  },
  {
    title: "Smart Filtering",
    description:
      "Curate your view. Organize notes by categories and difficulty for a personalized path.",
    icon: Filter,
  },
  {
    title: "Save & Bookmark",
    description:
      "Build your library. Bookmark critical notes for quick revision before your big interview.",
    icon: Bookmark,
  },
  {
    title: "Interactive Code",
    description:
      "Don't just read. Copy real-world examples and experiment with the implementation.",
    icon: Code,
  },
  {
    title: "Structured Learning",
    description:
      "Zero to Hero. Notes organized in a logical progression from basics to advanced patterns.",
    icon: BookMarked,
  },
  {
    title: "Pro Tips",
    description:
      "Industry secrets. Highlighted tips and common pitfalls to help you write production-grade code.",
    icon: Zap,
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 text-primary font-medium mb-4">
            <MousePointer2 className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider">Features</span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground mb-6"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            Built for Developers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every tool you need to master programming concepts efficiently and
            ace your technical interviews, all in one place.
          </p>
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, delay }: { feature: any; delay: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative border border-border/50 bg-card rounded-2xl px-6 py-8 hover:border-transparent transition-colors overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight Effect Overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
                    radial-gradient(
                    650px circle at ${mouseX}px ${mouseY}px,
                    rgba(var(--primary-rgb), 0.15),
                    transparent 80%
                    )
                `,
        }}
      />
      {/* Border Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
                    radial-gradient(
                    400px circle at ${mouseX}px ${mouseY}px,
                    rgba(var(--primary-rgb), 0.6),
                    transparent 80%
                    )
                `,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="mb-6 inline-flex p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <feature.icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
