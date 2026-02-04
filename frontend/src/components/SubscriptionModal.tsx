import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Check, ArrowRight } from "lucide-react"
import { Button } from "./ui/button"

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
    const navigate = useNavigate()

    if (!isOpen) return null

    const handleSubscribe = () => {
        onClose()
        navigate("/subscribe")
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
                >
                    {/* Header/Gradient */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full bg-white/20 p-1 text-white transition-colors hover:bg-white/30"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Premium Access</h2>
                                <p className="text-indigo-100 text-sm">Unlock the full potential of your learning.</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <h3 className="mb-4 text-xl font-semibold text-slate-800">Why upgrade to Pro?</h3>
                        <div className="space-y-4 mb-8">
                            {[
                                "Unlimited PDF Downloads",
                                "Priority Support for Doubt Solving",
                                "Advanced Interview Preparations",
                                "Exclusive Roadmap Access",
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-600">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleSubscribe}
                                className="h-12 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold transition-all hover:shadow-lg hover:shadow-indigo-200 group"
                            >
                                Subscribe Now
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <button
                                onClick={onClose}
                                className="py-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Maybe later, I'll stick with the free version
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 text-center">
                        <p className="text-xs text-slate-400">
                            Transform your coding journey today. Join 10,000+ happy learners.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default SubscriptionModal
