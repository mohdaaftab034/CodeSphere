import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const websiteName = import.meta.env.VITE_WEBSITE_NAME;

const faqs = [
    {
        category: "About CodeSphere",
        questions: [
            {
                question: `What is ${websiteName}?`,
                answer: `${websiteName} is a comprehensive learning platform designed for developers at all levels. We provide structured, in-depth learning modules covering full-stack development, system design, interview preparation, coding roadmaps, and handwritten notes from expert developers. Our mission is to help developers master programming concepts and ace their technical interviews.`
            },
            {
                question: "Who is CodeSphere for?",
                answer: "CodeSphere is designed for developers of all levels - from beginners starting their coding journey to experienced engineers preparing for senior roles. Whether you're learning a new technology, preparing for interviews at FAANG companies, or looking to deepen your understanding of system design, CodeSphere has resources tailored for you."
            },
            {
                question: "How is CodeSphere different from other learning platforms?",
                answer: "CodeSphere uniquely combines multiple learning formats: comprehensive text-based modules, interactive interview question banks with solutions, visual roadmaps for career progression, and handwritten notes from experienced developers. Our structured, curriculum-based approach focuses on 'architecting' your understanding rather than just copying code. All content is curated by industry experts and regularly updated."
            }
        ]
    },
    {
        category: "Learning Resources",
        questions: [
            {
                question: "What topics are covered in the notes?",
                answer: "Our notes cover a wide range of topics including JavaScript, React, TypeScript, Node.js, Express, MongoDB, SQL, System Design, Data Structures & Algorithms, Design Patterns, Microservices, DevOps, Docker, Kubernetes, and much more. Content is organized in chapters and sub-topics for structured learning from basics to advanced concepts."
            },
            {
                question: "Are the notes free to access?",
                answer: "Yes! We believe in democratizing education. Most of our core content, including all chapter notes and basic interview questions, is completely free for everyone. This includes learning materials, code examples, and fundamental interview preparation content. Premium features like advanced interview questions, exclusive handwritten notes, and mentorship are available with our paid plans."
            },
            {
                question: "Can I search and filter the notes?",
                answer: "Absolutely! Our platform features powerful search functionality that lets you find concepts instantly across all notes. You can filter by topic, chapter, difficulty level, and technology stack. Our smart filtering system helps you organize content based on your learning goals and expertise level."
            },
            {
                question: "Can I bookmark or save notes?",
                answer: "Yes! You can bookmark important notes and build your personal learning library. Bookmarked content is saved in your dashboard for quick revision before interviews or when you need a quick reference."
            },
            {
                question: "Are there code examples in the notes?",
                answer: "Yes, our notes include interactive code examples from real-world projects. You can copy code snippets and experiment with implementations directly. We focus on practical examples that demonstrate how concepts are actually used in production applications."
            }
        ]
    },
    {
        category: "Interview Preparation",
        questions: [
            {
                question: "What interview questions are available?",
                answer: "We have curated thousands of interview questions across multiple roles: Frontend Developer, Backend Developer, Full Stack Developer, Software Developer, Web Developer, and more. Questions are categorized by difficulty (Beginner, Intermediate, Advanced) and topic (JavaScript, React, System Design, Data Structures, etc.). Many questions include detailed solutions and explanations."
            },
            {
                question: "Can I filter interview questions by difficulty?",
                answer: "Yes! All interview questions can be filtered by difficulty level (Beginner, Intermediate, Advanced) and by topic/category. You can also search for specific concepts. This helps you create a personalized interview preparation plan that matches your current skill level."
            },
            {
                question: "Are interview solutions explained?",
                answer: "Yes, our interview questions come with comprehensive solutions that explain the approach, complexity analysis, and common pitfalls. Many solutions include code implementations, alternative approaches, and tips for discussing your answer in an actual interview."
            },
            {
                question: "Do you have company-specific interview questions?",
                answer: "Our interview questions cover common patterns asked across top tech companies. While we don't focus on company-specific lists, the questions we provide represent the types of problems you'll encounter at major tech companies. Premium subscribers get access to additional curated question sets and industry secrets."
            },
            {
                question: "Can I download interview questions as PDF?",
                answer: "Yes! With a premium subscription, you can download interview question sets as PDFs for offline study. This is especially useful for interview prep sessions or when you want to study without internet connectivity."
            }
        ]
    },
    {
        category: "Handwritten Notes & PDFs",
        questions: [
            {
                question: "What are handwritten notes?",
                answer: "Handwritten notes are authentic, hand-written explanations and diagrams created by experienced developers and tutors. These notes capture complex concepts in a more intuitive way, often with hand-drawn diagrams, highlighted key points, and margin notes. They're available in PDF format for easy viewing and reference."
            },
            {
                question: "How are handwritten notes different from regular notes?",
                answer: "Handwritten notes provide a more personal, visual learning experience. They often include hand-drawn diagrams, flowcharts, and annotations that are sometimes easier to understand than purely text-based content. They capture the thought process of experienced developers and can provide insights that text alone might miss."
            },
            {
                question: "Are handwritten notes free?",
                answer: "Some handwritten notes are available for free, while premium handwritten note collections are available with our paid subscription plans. Free handwritten notes are refreshed regularly as part of our community contribution initiatives."
            },
            {
                question: "Can I view handwritten notes on mobile?",
                answer: "Yes! Handwritten notes are available in PDF format and can be viewed on any device - desktop, tablet, or mobile. You can download them for offline viewing and they support standard PDF features like zoom, search, and bookmarking."
            }
        ]
    },
    {
        category: "Roadmaps & Career Guidance",
        questions: [
            {
                question: "What are the career roadmaps?",
                answer: "Our roadmaps are visual learning paths that guide you from beginner to expert in various technologies and roles. Each roadmap shows the logical progression of skills, recommended learning order, prerequisite knowledge, and milestones. We have roadmaps for Frontend Development, Backend Development, Full Stack Development, DevOps, System Design, and more."
            },
            {
                question: "How do I use the roadmaps?",
                answer: "Start with a roadmap that matches your goal (e.g., 'Become a Frontend Developer'). Follow the recommended learning path in order, as each topic builds on previous knowledge. The roadmap shows which topics are prerequisites, which are optional, and which are advanced. You can track your progress and revisit topics as needed."
            },
            {
                question: "Can I customize my learning roadmap?",
                answer: "Yes! While we provide recommended paths, you can choose your own learning sequence based on your goals, existing knowledge, and available time. You can skip topics you already know, dive deeper into areas of interest, and customize your learning experience."
            },
            {
                question: "Do roadmaps include time estimates?",
                answer: "Our roadmaps include estimated time for each topic based on average learning pace. However, actual time may vary based on your background and the depth you want to achieve. Beginners might take longer while experienced developers might move faster."
            }
        ]
    },
    {
        category: "Premium & Pricing",
        questions: [
            {
                question: "What's included in the premium subscription?",
                answer: "Premium subscriptions include access to all advanced interview questions, exclusive handwritten notes, PDF downloads, 1-on-1 mentorship sessions with senior engineers, priority support, and exclusive content updates. Check our pricing page for detailed plan comparison."
            },
            {
                question: "How much does a premium subscription cost?",
                answer: "We offer flexible pricing plans to suit different budgets. Visit our pricing page for current prices, available plans, and any ongoing promotions. We regularly update our pricing with new features and value additions."
            },
            {
                question: "Can I try premium features before subscribing?",
                answer: "Yes! We offer a trial period for new subscribers to experience premium features. This gives you time to explore all the benefits before committing to a paid plan. Some premium features also have limited free access."
            },
            {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription anytime without penalties. Your access to premium content will continue until the end of your current billing period. We believe in providing flexibility because we're confident our content provides real value."
            },
            {
                question: "Do you offer team or organization licenses?",
                answer: "Yes! For teams and organizations interested in bulk licenses or custom plans, please contact our support team. We offer special pricing and features for educational institutions and companies. Reach out through our contact page for more information."
            }
        ]
    },
    {
        category: "Mentorship & Community",
        questions: [
            {
                question: "Do you offer mentorship?",
                answer: "Yes! Premium subscribers get access to 1-on-1 mentorship sessions with senior engineers from top tech companies. Mentors can help guide your career path, review your interview prep, and provide personalized learning recommendations."
            },
            {
                question: "How do mentorship sessions work?",
                answer: "Mentorship sessions are scheduled 1-on-1 calls with experienced engineers. You can discuss interview strategies, get code review feedback, explore career opportunities, or ask questions about specific concepts. Sessions are typically 30-60 minutes and scheduled based on mutual availability."
            },
            {
                question: "Can I contribute content to CodeSphere?",
                answer: "Absolutely! We're community-driven and encourage contributions. You can suggest edits to existing notes, submit new topics, share your handwritten notes, contribute interview questions, or create content for our community. Contributors are credited and may receive special recognition."
            },
            {
                question: "Is there a community forum or discussion board?",
                answer: "Yes! Our community is active across multiple channels. You can discuss concepts, ask questions, share resources, and connect with other developers preparing for similar goals. Community members often help each other with clarifications and insights."
            }
        ]
    },
    {
        category: "Account & Technical",
        questions: [
            {
                question: "How do I create an account?",
                answer: "Click the 'Login' or 'Sign Up' button on our website. You can sign up using your email address or social media accounts (Google, GitHub, LinkedIn). After signing up, you'll have instant access to all free content."
            },
            {
                question: "Can I change my account information?",
                answer: "Yes! You can update your profile information, email, password, and preferences in your account settings. Visit the Settings page in your dashboard to make changes to your account."
            },
            {
                question: "How do I reset my password?",
                answer: "On the login page, click 'Forgot Password' and enter your email address. You'll receive an email with a link to reset your password. Follow the link and create a new password. If you don't receive the email, check your spam folder."
            },
            {
                question: "What devices can I use to access CodeSphere?",
                answer: "CodeSphere works on all devices - desktop computers, tablets, and smartphones. Our website is fully responsive and optimized for all screen sizes. You can seamlessly switch between devices while maintaining your progress and bookmarks."
            },
            {
                question: "Do you have a mobile app?",
                answer: "Currently, our web application is fully responsive and works great on mobile devices. We're constantly optimizing the mobile experience. Check back for updates about dedicated mobile apps."
            },
            {
                question: "What is the best browser to use CodeSphere?",
                answer: "CodeSphere works well with all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best performance and security. If you experience issues, try clearing your browser cache or using a different browser."
            }
        ]
    },
    {
        category: "Content Quality & Updates",
        questions: [
            {
                question: "How often is content updated?",
                answer: "We regularly update our content to reflect the latest technologies, best practices, and industry trends. Interview questions are updated based on what companies are actually asking. Our content team continuously reviews and enhances learning materials."
            },
            {
                question: "Who creates the content on CodeSphere?",
                answer: "Our content is created and reviewed by experienced software engineers, architects, and educators from top tech companies. Many are former FAANG engineers, published authors, and industry experts. All content goes through rigorous quality checks before publication."
            },
            {
                question: "How accurate are the code examples?",
                answer: "All code examples are tested and verified to work correctly. We provide examples in multiple languages where applicable and include explanations of key concepts. If you find an error, please report it through our feedback system and we'll fix it promptly."
            },
            {
                question: "Can I request specific topics or content?",
                answer: "Yes! We value community feedback. You can submit content requests through our feedback form or contact us directly. Popular requests are prioritized for creation. We're always looking to expand our content based on learner needs."
            }
        ]
    },
    {
        category: "Getting Help",
        questions: [
            {
                question: "How do I contact support?",
                answer: "Visit our Contact page to send us a message. We also have a feedback form on the platform where you can report issues, suggest improvements, or ask questions. Our support team typically responds within 24-48 hours."
            },
            {
                question: "What if I find a mistake in the content?",
                answer: "Please report it immediately through our feedback form or by contacting support. Include the page/topic where you found the error and what the mistake is. We appreciate corrections as they help us maintain high-quality content."
            },
            {
                question: "Do you have documentation or tutorials for new users?",
                answer: "Yes! New users get an onboarding guide that explains how to navigate the platform, use search and filters, bookmark content, and access premium features. You can also revisit this guide anytime from your dashboard."
            },
            {
                question: "What should I do if the website isn't loading properly?",
                answer: "First, try refreshing the page or clearing your browser cache. Ensure you're using an up-to-date browser. If the issue persists, try a different browser or device. If problems continue, contact our support team with details about what you're experiencing."
            }
        ]
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<string | null>("About CodeSphere-0");

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-950/20">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-950 dark:text-blue-50" style={{ fontFamily: "var(--font-cal-sans)" }}>
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about {websiteName} and how to get the most out of our platform.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {faqs.map((category, categoryIdx) => (
                        <div key={categoryIdx}>
                            <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 px-2 flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full" />
                                {category.category}
                            </h3>
                            <div className="space-y-3">
                                {category.questions.map((faq, faqIdx) => {
                                    const faqId = `${category.category}-${faqIdx}`;
                                    const isOpen = openIndex === faqId;
                                    return (
                                        <motion.div
                                            key={faqIdx}
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: faqIdx * 0.05 }}
                                            className="bg-white dark:bg-slate-950 rounded-lg overflow-hidden shadow-md shadow-blue-900/5 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
                                        >
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : faqId)}
                                                className={`w-full flex items-center justify-between p-4 md:p-5 text-left transition-all duration-300 ${isOpen
                                                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                                                        : "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                <span className="font-semibold text-base md:text-lg pr-8 text-left">{faq.question}</span>
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-white/20 rotate-180" : "bg-indigo-600/10 dark:bg-indigo-400/10"
                                                    }`}>
                                                    <ChevronDown
                                                        className={`w-4 h-4 transition-colors ${isOpen ? "text-white" : "text-indigo-600 dark:text-indigo-400"
                                                            }`}
                                                    />
                                                </div>
                                            </button>
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                    }`}
                                            >
                                                <div className="overflow-hidden bg-white dark:bg-slate-950">
                                                    <div className="p-4 md:p-5 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base border-t border-slate-200 dark:border-slate-800">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
