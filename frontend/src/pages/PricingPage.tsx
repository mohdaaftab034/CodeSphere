import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Check, Sparkles, Zap, Shield, Rocket } from "lucide-react";
import { Button } from "../components/ui/button";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      icon: <Rocket className="w-5 h-5 text-blue-500" />,
      price: isYearly ? "0" : "0",
      description: "Ideal for beginners and students.",
      features: [
        "Access to basic notes",
        "5 Bookmarks per day",
        "Community support",
        "Standard PDF quality",
      ],
      color: "blue",
    },
    {
      name: "Pro",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      price: isYearly ? "79" : "9",
      description: "Everything you need to ace interviews.",
      features: [
        "Unlimited Premium notes",
        "Unlimited Bookmarks",
        "Priority Support",
        "Interview Prep Kits",
        "Exclusive Roadmaps",
        "Ad-free experience",
      ],
      popular: true,
      color: "amber",
    },
    {
      name: "Enterprise",
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      price: isYearly ? "249" : "29",
      description: "Best for teams and coding bootcamps.",
      features: [
        "Everything in Pro",
        "Team Dashboard",
        "Custom Content Requests",
        "1-on-1 Mentorship",
        "API Access",
      ],
      color: "purple",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary-opacity)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Sparkles className="w-3 h-3" /> Pricing Plans
            </motion.div>
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              Invest in your{" "}
              <span className="text-primary text-gradient">Career</span>
            </h1>

            {/* Toggle switch */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span
                className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-14 h-7 bg-secondary rounded-full p-1 transition-colors duration-300"
              >
                <motion.div
                  animate={{ x: isYearly ? 28 : 0 }}
                  className="w-5 h-5 bg-primary rounded-full shadow-sm"
                />
              </button>
              <span
                className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Yearly{" "}
                <span className="text-xs text-emerald-500 font-bold ml-1">
                  Save 25%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative p-8 rounded-3xl border transition-all duration-300 group ${
                  plan.popular
                    ? "bg-card border-primary shadow-2xl shadow-primary/10 py-12"
                    : "bg-card/50 border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                    BEST VALUE
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-secondary group-hover:scale-110 transition-transform">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-extrabold tracking-tight">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground font-medium ml-1">
                    /{isYearly ? "year" : "mo"}
                  </span>
                </div>

                <Button
                  className={`w-full h-12 rounded-xl font-bold text-base transition-all active:scale-95 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-white"
                  }`}
                >
                  Get Started
                </Button>

                <div className="my-8 border-t border-border/50" />

                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm text-muted-foreground leading-tight"
                    >
                      <div className="mt-0.5 p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* FAQ Link or Trust Badge */}
          <p className="text-center text-sm text-muted-foreground mt-12">
            All plans include a 7-day money-back guarantee.{" "}
            <br className="hidden sm:block" />
            No hidden fees. Cancel anytime.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
