import cron from "node-cron"
import InterviewQuestion from "../models/InterviewQuestion.js"
import { sendInterviewQuestionNotification } from "./notificationService.js"

const frontendUrl = process.env.FRONTEND_URL || ""
const frontendBaseUrl = frontendUrl.replace(/\/$/, "")

// Store scheduled tasks
const scheduledTasks = {}
 
/**
 * Initialize daily interview question scheduler
 * Publishes a new interview question every day at a specified time
 * @param {string} cronTime - Cron expression (default: every day at 9 AM)
 */
export const initializeInterviewQuestionScheduler = (cronTime = "0 9 * * *") => {
  try {
    // Cancel any existing task
    if (scheduledTasks.interviewQuestion) {
      scheduledTasks.interviewQuestion.stop()
      console.log("⏹Stopped existing interview question scheduler")
    }

    // Schedule the task
    const task = cron.schedule(cronTime, async () => {
      try {
        console.log("Running scheduled interview question task...")

        // Fetch a random published interview question
        const questions = await InterviewQuestion.find({ isPublished: true }).lean()

        if (questions.length === 0) {
          console.log("No published interview questions available")
          return
        }

        // Select a random question
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

        console.log(`Publishing daily interview question: "${randomQuestion.question || randomQuestion.title || 'Question'}"`)

        // Send notification to all users with direct link to the question
        const questionUrl = `${frontendBaseUrl}/interview/question/${randomQuestion._id}`
        await sendInterviewQuestionNotification(randomQuestion, questionUrl)

        console.log("Daily interview question notification sent successfully")
      } catch (error) {
        console.error("Error in interview question scheduler:", error.message)
      }
    })

    scheduledTasks.interviewQuestion = task
    console.log(`Interview question scheduler initialized - Cron: ${cronTime}`)

    return task
  } catch (error) {
    console.error("Failed to initialize interview question scheduler:", error.message)
  }
}

/**
 * Stop the interview question scheduler
 */
export const stopInterviewQuestionScheduler = () => {
  if (scheduledTasks.interviewQuestion) {
    scheduledTasks.interviewQuestion.stop()
    delete scheduledTasks.interviewQuestion
    console.log("Interview question scheduler stopped")
  }
}

/**
 * Get status of all scheduled tasks
 */
export const getSchedulerStatus = () => {
  return {
    interviewQuestion: !!scheduledTasks.interviewQuestion,
  }
}

export default {
  initializeInterviewQuestionScheduler,
  stopInterviewQuestionScheduler,
  getSchedulerStatus,
}
