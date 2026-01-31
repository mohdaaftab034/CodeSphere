import nodemailer from "nodemailer"
import User from "../models/User.js"

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Send email notification to all users
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @param {array} userEmails - Optional: specific emails to send to (if not provided, sends to all users)
 */
export const sendNotificationToUsers = async (subject, htmlContent, userEmails = null) => {
  try {
    let emails = []

    if (userEmails && Array.isArray(userEmails) && userEmails.length > 0) {
      emails = userEmails
    } else {
      // Fetch all user emails from database
      const users = await User.find({}, "email").lean()
      emails = users.map((user) => user.email)
    }

    if (emails.length === 0) {
      console.log(" No users found to send notifications")
      return { success: false, message: "No users found" }
    }

    // Send email to all users
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: emails.join(","), // Use BCC to send to multiple users while hiding other recipients
      subject: subject,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log(` Notification sent to ${emails.length} users: ${subject}`)
    return { success: true, usersNotified: emails.length }
  } catch (error) {
    console.error("Error sending notification:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Send interview question notification
 * @param {object} question - Interview question object
 */
export const sendInterviewQuestionNotification = async (question) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📚 New Interview Question Available!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
          Hello,
        </p>

        <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
          A new interview question has been published! Check it out to prepare for your next interview.
        </p>

        <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #999; text-transform: uppercase;">Question Details:</p>
          <h2 style="margin: 10px 0; color: #333; font-size: 16px;">${escapeHtml(question.title)}</h2>
          <p style="margin: 10px 0; color: #666; line-height: 1.6;">
            <strong>Role:</strong> ${escapeHtml(question.roles?.join(", ") || "General")}<br/>
            <strong>Difficulty:</strong> ${escapeHtml(question.difficulty || "Medium")}
          </p>
          <p style="margin: 10px 0; color: #555; line-height: 1.6;">
            ${escapeHtml(question.question || "").substring(0, 200)}${question.question?.length > 200 ? "..." : ""}
          </p>
        </div>

        <div style="background: #667eea; border-radius: 4px; padding: 0; text-align: center;">
          <a href="https://codenotes.dev/interview" style="display: inline-block; color: white; text-decoration: none; padding: 12px 30px; font-weight: bold;">
            View Question
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          Keep practicing and improving your interview skills!<br/>
          <strong>Coding Notes Team</strong><br/>
          <a href="https://codenotes.dev" style="color: #667eea; text-decoration: none;">codenotes.dev</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
        <p>You received this email because you're registered on Coding Notes Platform.</p>
      </div>
    </div>
  `

  return await sendNotificationToUsers("New Interview Question - Interview Preparation", htmlContent)
}

/**
 * Send notes upload notification
 * @param {object} note - Note object
 * @param {string} noteUrl - Direct URL to the notes
 */
export const sendNotesUploadNotification = async (note, noteUrl) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📝 New Notes Published!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
          Hello,
        </p>

        <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
          New comprehensive notes have been added to help you learn and prepare better!
        </p>

        <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #999; text-transform: uppercase;">Notes Details:</p>
          <h2 style="margin: 10px 0; color: #333; font-size: 16px;">${escapeHtml(note.title)}</h2>
          <p style="margin: 10px 0; color: #666; line-height: 1.6;">
            <strong>Chapter:</strong> ${escapeHtml(note.chapter || "General")}<br/>
            <strong>Topic:</strong> ${escapeHtml(note.topic || "Miscellaneous")}
          </p>
          <p style="margin: 10px 0; color: #555; line-height: 1.6;">
            ${note.description ? escapeHtml(note.description).substring(0, 200) + (note.description.length > 200 ? "..." : "") : "Check out the full notes for comprehensive content."}
          </p>
        </div>

        <div style="background: #667eea; border-radius: 4px; padding: 0; text-align: center; margin-bottom: 15px;">
          <a href="${escapeHtml(noteUrl)}" style="display: inline-block; color: white; text-decoration: none; padding: 12px 30px; font-weight: bold;">
            Read Notes
          </a>
        </div>

        <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 12px; margin-top: 20px; font-size: 13px; color: #004085;">
          <strong>💡 Tip:</strong> You can save these notes to your profile for quick access anytime.
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          Keep learning and growing with Coding Notes!<br/>
          <strong>Coding Notes Team</strong><br/>
          <a href="https://codenotes.dev" style="color: #667eea; text-decoration: none;">codenotes.dev</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
        <p>You received this email because you're registered on Coding Notes Platform.</p>
      </div>
    </div>
  `

  return await sendNotificationToUsers(`New Notes: ${note.title}`, htmlContent)
}

export default {
  sendNotificationToUsers,
  sendInterviewQuestionNotification,
  sendNotesUploadNotification,
}
