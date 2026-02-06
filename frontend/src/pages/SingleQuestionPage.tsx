import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
    ChevronLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Share2,
    Bookmark,
    MessageSquare
} from "lucide-react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Button } from "../components/ui/button"
import { interviewAPI } from "../lib/api"
import { InterviewQuestionRenderer } from "../components/InterviewQuestionRenderer"
import { toast } from "react-hot-toast"
 
export default function SingleQuestionPage() {
    const { id } = useParams<{ id: string }>()
    const [question, setQuestion] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!id) return
            try {
                setIsLoading(true)
                const response = await interviewAPI.getById(id)
                if (response.success) {
                    setQuestion(response.question)
                } else {
                    setError("Question not found")
                }
            } catch (err: any) {
                console.error("Error fetching question:", err)
                setError(err.message || "Failed to load question")
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuestion()
    }, [id])

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
    }

    const roleSlug = question?.roles?.[0]
        ? question.roles[0].toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : null

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !question) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
                    <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Oops! Question not found</h1>
                    <p className="text-muted-foreground mb-8">
                        The question you're looking for might have been moved or deleted.
                    </p>
                    <Button asChild>
                        <Link to="/interview">Back to Interview Prep</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumbs / Back Navigation */}
                    <div className="mb-8 flex items-center justify-between">
                        <Link
                            to={roleSlug ? `/interview-questions/role/${roleSlug}` : "/interview"}
                            className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                            Back to {question.roles?.[0] || 'Interview'} Prep
                        </Link>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleShare} title="Share">
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Save">
                                <Bookmark className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Question Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-8 rounded-2xl bg-card border border-border overflow-hidden relative"
                    >
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {question.roles?.map((role: string) => (
                                    <span key={role} className="px-3 py-1 bg-secondary text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                                        {role}
                                    </span>
                                ))}
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${question.difficulty?.toLowerCase() === 'advanced' ? 'bg-red-500/10 text-red-500' :
                                        question.difficulty?.toLowerCase() === 'intermediate' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    {question.difficulty}
                                </span>
                                {question.views > 0 && (
                                    <span className="text-xs text-muted-foreground flex items-center ml-2">
                                        <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                                        {question.views} views
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                                {question.question}
                            </h1>
                        </div>
                    </motion.div>

                    {/* Answer Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold">Expert Answer</h2>
                        </div>

                        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8">
                            <InterviewQuestionRenderer content={question.answer || "No answer provided yet."} />
                        </div>

                        {/* Motivation Box */}
                        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                            <p className="text-sm text-muted-foreground italic text-center">
                                Check out more questions for <span className="font-bold text-foreground">{question.roles?.[0] || 'this role'}</span> to master your next interview!
                            </p>
                            <div className="mt-4 flex justify-center">
                                <Button asChild variant="outline" size="sm">
                                    <Link to={roleSlug ? `/interview-questions/role/${roleSlug}` : "/interview"}>
                                        View All {question.roles?.[0] || 'Role'} Questions
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
