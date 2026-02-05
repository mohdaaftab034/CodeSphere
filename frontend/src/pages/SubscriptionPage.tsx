import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, Sparkles, ShieldCheck, Zap, CreditCard, ChevronRight } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { authAPI, subscriptionAPI } from "../lib/api"
import { toast } from "react-hot-toast"

declare global {
    interface Window {
        Razorpay: any
    }
}

const SubscriptionPage = () => {
    const websiteName = import.meta.env.VITE_WEBSITE_NAME
    const { user, login, logout, token, isLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [planType, setPlanType] = useState<"monthly" | "yearly">("yearly")
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<string | null>(null)

    useEffect(() => {
        document.title = `Subscribe | ${websiteName}`
    }, [websiteName])

    // Fetch subscription status when component loads or user changes
    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            if (user && token) {
                try {
                    const status = await subscriptionAPI.getStatus(token)
                    if (status.subscriptionExpiresAt) {
                        setSubscriptionExpiryDate(status.subscriptionExpiresAt)
                    }
                } catch (err) {
                    console.error("Failed to fetch subscription status:", err)
                }
            }
        }

        fetchSubscriptionStatus()
    }, [user, token])

    useEffect(() => {
        document.title = `Subscribe | ${websiteName}`
    }, [websiteName])

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handleSubscription = async () => {
        if (isLoading) {
            toast.error("Loading session. Please try again in a moment")
            return
        }

        if (!user) {
            toast.error("Please login to subscribe")
            return
        }

        const storedToken = localStorage.getItem("token")
        const authToken = token || (storedToken && storedToken !== "null" ? storedToken : null)

        if (!authToken) {
            toast.error("Authentication token missing. Please login again")
            return
        }

        setLoading(true)
        try {
            // Validate token before creating order
            try {
                await authAPI.getProfile(authToken)
            } catch (authErr: any) {
                logout()
                toast.error("Session expired. Please login again")
                return
            }

            // 1. Create order on backend
            const { order } = await subscriptionAPI.createOrder(authToken, planType)

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: order.amount,
                currency: order.currency,
                name: `${websiteName} Pro`,
                description: `${planType === 'monthly' ? 'Monthly' : 'Yearly'} Unlimited PDF Access & Premium Features`,
                image: "/logo.png",
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        // 3. Verify payment on backend
                        const verifyRes = await subscriptionAPI.verifyPayment(authToken, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })

                        if (verifyRes.success) {
                            toast.success("Welcome to Pro! Subscription active.")
                            // Update local user state
                            if (authToken) {
                                login(authToken, { ...user, isPaid: true })
                            }
                        }
                    } catch (err: any) {
                        console.error("Payment verification error:", err)
                        const errorMessage = err.message || err.response?.data?.message || "Verification failed"
                        toast.error(errorMessage)
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#6366f1",
                },
            }

            const rzp1 = new window.Razorpay(options)
            rzp1.open()
        } catch (err: any) {
            console.error("Payment initiation error:", err)
            const errorMessage = err.message || err.response?.data?.message || "Failed to initiate payment"

            // Handle 401 specifically
            if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Authentication")) {
                logout()
                toast.error("Session expired. Please login again")
            } else {
                toast.error(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    const features = [
        { title: "Unlimited PDF Downloads", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Exclusive Roadmaps", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
        { title: "Priority Doubt Solving", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Ad-Free Experience", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
    ]

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6"
                    >
                        <Sparkles size={16} />
                        <span>{websiteName} Pro</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6"
                    >
                        Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">coding game</span>
                    </motion.h1>

                    {/* Plan Toggle */}
                    <div className="flex flex-col items-center mt-8">
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex items-center relative gap-1">
                            <button
                                onClick={() => setPlanType("monthly")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${planType === 'monthly' ? 'text-indigo-600' : 'text-slate-500'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPlanType("yearly")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all z-10 flex items-center gap-2 ${planType === 'yearly' ? 'text-indigo-600' : 'text-slate-500'}`}
                            >
                                Yearly
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${planType === 'yearly' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    Best Value
                                </span>
                            </button>

                            {/* Animated Background */}
                            <motion.div
                                className="absolute bg-indigo-50 rounded-xl"
                                layoutId="activePlan"
                                initial={false}
                                animate={{
                                    x: planType === 'monthly' ? 4 : 100,
                                    width: planType === 'monthly' ? 95 : 125,
                                    height: 'calc(100% - 8px)'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch pt-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                            <Zap className="text-indigo-600" /> Pro Features
                        </h2>
                        <div className="space-y-6">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${feature.bg} ${feature.color}`}>
                                        <feature.icon size={20} />
                                    </div>
                                    <span className="font-medium text-slate-700">{feature.title}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-top border-slate-100">
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2">
                                <ShieldCheck size={16} />
                                <span>Secure Checkout</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Your payment details are processed securely through Razorpay.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 flex flex-col justify-between overflow-hidden relative"
                    >
                        {/* Shimmer Effect */}
                        {planType === 'yearly' && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-full"
                                animate={{ x: ['-200%', '200%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                        )}

                        <div>
                            <div className="flex justify-between items-start mb-8 relative">
                                <div>
                                    <h3 className="text-xl font-bold mb-1 text-indigo-100 italic">
                                        {planType === 'monthly' ? 'Power Plan' : 'Legend Plan'}
                                    </h3>
                                    <p className="text-indigo-200 text-sm italic">
                                        {planType === 'monthly' ? 'Perfect for quick prep' : 'The ultimate learning fuel'}
                                    </p>
                                </div>
                                {planType === 'yearly' && (
                                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                        SAVE 45%
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-2 mb-8 relative">
                                <motion.span
                                    key={planType}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-5xl font-extrabold"
                                >
                                    ₹{planType === 'monthly' ? '299' : '1899'}
                                </motion.span>
                                <span className="text-indigo-200 italic">/{planType === 'monthly' ? 'month' : 'year'}</span>
                                {planType === 'yearly' && (
                                    <span className="text-indigo-300 line-through text-lg ml-2 italic">₹3499</span>
                                )}
                                {planType === 'monthly' && (
                                    <span className="text-indigo-300 line-through text-lg ml-2 italic">₹399</span>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8 relative">
                                <li className="flex items-center gap-3 text-indigo-100 italic">
                                    <Check size={18} className="text-indigo-300" />
                                    <span>Full {planType === 'monthly' ? 'Month' : 'Year'} Access</span>
                                </li>
                                <li className="flex items-center gap-3 text-indigo-100 italic">
                                    <Check size={18} className="text-indigo-300" />
                                    <span>Future Content Access</span>
                                </li>
                                <li className="flex items-center gap-3 text-indigo-100 italic">
                                    <Check size={18} className="text-indigo-300" />
                                    <span>Premium Community Access</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleSubscription}
                            disabled={loading || user?.isPaid}
                            className={`h-14 w-full rounded-2xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 relative ${user?.isPaid
                                ? "bg-emerald-500 hover:bg-emerald-500 cursor-default"
                                : "bg-white text-indigo-600 hover:bg-slate-50 hover:scale-[1.02]"
                                }`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                            ) : user?.isPaid ? (
                                <>
                                    <ShieldCheck size={20} />
                                    <div className="flex flex-col items-start gap-0">
                                        <span>Active Pro Member</span>
                                        {subscriptionExpiryDate && (
                                            <span className="text-xs font-normal">
                                                Expires: {new Date(subscriptionExpiryDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    Unlock {planType === 'monthly' ? 'Monthly' : 'Yearly'} Access
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>

                {/* FAQ/Trust Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
                >
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                            <Zap className="text-indigo-600" size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 italic">Instant Access</h4>
                        <p className="text-sm text-slate-500 italic">Unlock all notes and roadmaps immediately after payment.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                            <ShieldCheck className="text-indigo-600" size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 italic">Secure Payment</h4>
                        <p className="text-sm text-slate-500 italic">Encrypted transactions via Razorpay, India's most trusted gateway.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                            <Zap className="text-indigo-600" size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 italic">Cancel Anytime</h4>
                        <p className="text-sm text-slate-500 italic">No hidden charges or automated recurring payments.</p>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-16 text-slate-400 text-sm"
                >
                    Have questions? Contact our support at <a href="/contact" className="text-indigo-500 hover:underline">contact support</a>
                </motion.p>
            </div>
        </div>
    )
}

export default SubscriptionPage
