import nodemailer from "nodemailer"
import dotenv from "dotenv"
import User from "../models/User.js"

// Ensure environment variables are loaded
dotenv.config()

const websiteName = process.env.WEBSITE_NAME || "CodeSphere"
const frontendUrl = process.env.FRONTEND_URL || ""
const frontendBaseUrl = frontendUrl.replace(/\/$/, "")
const frontendDisplayUrl = frontendBaseUrl.replace(/^https?:\/\//, "")

// Function to create email transporter with validation
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_PASSWORD

  if (!emailUser || !emailPassword) {
    console.error("❌ Email credentials not configured. EMAIL_USER and EMAIL_PASSWORD must be set in .env")
    return null
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    })

    return transporter
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message)
    return null
  }
}

// Initialize email transporter (lazy initialization)
let transporter = null

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

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
 * Base template generator for consistent branding
 * @param {string} title - The title/header of the email
 * @param {string} content - The main body HTML
 * @param {string} preheader - Optional preheader text for email clients
 * @param {string} ctaLabel - Optional CTA button text
 * @param {string} ctaUrl - Optional CTA button URL
 * @returns {string} Complete HTML email
 */
export const generateBaseTemplate = (title, content, preheader = "", ctaLabel = "", ctaUrl = frontendBaseUrl) => {

  // Ensure ctaUrl defaults to frontendBaseUrl if not provided
  const finalCtaUrl = ctaUrl || frontendBaseUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" /> 
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
    .content { padding: 40px 32px; color: #1e293b; line-height: 1.6; }
    .footer { background-color: #f1f5f9; padding: 32px; text-align: center; color: #64748b; font-size: 13px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 700; font-size: 16px; margin: 24px 0; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
    .link { color: #6366f1; text-decoration: none; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; padding: 40px 0;">
    <tr>
      <td align="center"> 
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div style="font-size: 40px; margin-bottom: 12px;">🚀</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">${title}</h1>
          </div>
          
          <!-- Body -->
          <div class="content">
            ${content}
            ${finalCtaUrl ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${finalCtaUrl}" class="button">${ctaLabel || "View Details"}</a>
            </div>` : ""}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px; font-weight: 700; color: #475569; font-size: 15px;">${websiteName}</p>
            <p style="margin: 0 0 16px;">
              <a href="${frontendBaseUrl}" class="link">${frontendDisplayUrl || frontendBaseUrl}</a>
            </p>
            <p style="margin: 0; font-size: 11px; line-height: 1.5;">
              You are receiving this because you're part of our learning community.<br/>
              &copy; ${new Date().getFullYear()} ${websiteName}. All rights reserved.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send email notification to all users
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @param {array} userEmails - Optional: specific emails to send to (if not provided, sends to all users)
 */
export const sendNotificationToUsers = async (subject, htmlContent, userEmails = null) => {
  try {
    const emailTransporter = getTransporter()
    if (!emailTransporter) {
      return { success: false, error: "Email transporter not configured" }
    }

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
      from: `"${websiteName}" <${process.env.EMAIL_USER}>`,
      bcc: emails.join(","), // Use BCC to send to multiple users while hiding other recipients
      subject: subject,
      html: htmlContent,
    }

    await emailTransporter.sendMail(mailOptions)
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
 * @param {string} questionUrl - Optional: Direct URL to the question (if not provided, will use generic interview page)
 */
export const sendInterviewQuestionNotification = async (question, questionUrl = null) => {
  const finalQuestionUrl = questionUrl || (question._id
    ? `${process.env.FRONTEND_URL}/interview/question/${question._id}`
    : `${process.env.FRONTEND_URL}/interview`)

  const content = `
    <p style="margin-top: 0;">Hi learner 👋,</p>
    <p>A brand new interview question has just been published! Sharpen your skills and stay ahead of the curve with today's challenge.</p>
    
    <div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <div class="badge" style="background-color: #6366f1; color: #ffffff;">Interview Prep</div>
      <h2 style="margin: 8px 0; font-size: 20px; color: #0f172a;">${escapeHtml(question.question || "New Interview Question")}</h2>
      <p style="margin: 12px 0; font-size: 14px; color: #64748b;">
        <strong>Role:</strong> ${escapeHtml(question.roles?.join(", ") || "General")}<br/>
        <strong>Difficulty:</strong> ${escapeHtml(question.difficulty || "Medium")}
      </p>
      ${question.description ? `
      <p style="margin: 12px 0 0; font-size: 14px; color: #475569; font-style: italic;">
        "${escapeHtml(question.description).substring(0, 160)}${question.description.length > 160 ? "..." : ""}"
      </p>` : ""}
    </div>
    
    <p>Consistency is key to cracking your dream job. Take 5 minutes to solve this now!</p>
  `;

  const htmlContent = generateBaseTemplate(
    "New Interview Challenge",
    content,
    "Level up your prep with our latest interview question.",
    "Solve Question →",
    finalQuestionUrl
  );

  return await sendNotificationToUsers("New Interview Question - Interview Preparation", htmlContent)
}

/**
 * Send OTP email to user
 * @param {string} userEmail - User's email address
 * @param {string} otp - OTP code to send
 */
export const sendOtpEmail = async (userEmail, otp) => {
  const emailTransporter = getTransporter();
  if (!emailTransporter) {
    return { success: false, error: "Email configuration missing." };
  }

  const content = `
    <p style="margin-top: 0; text-align: center;">To finish logging in, please enter the following code:</p>
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background-color: #f1f5f9; padding: 20px 40px; border-radius: 12px; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b; border: 2px dashed #cbd5e1;">
        ${otp}
      </div>
    </div>
    <p style="text-align: center; font-size: 14px; color: #64748b;">
      This code is valid for <strong>10 minutes</strong>.<br/>
      If you didn't request this, you can safely ignore this email.
    </p>
  `;

  const htmlContent = generateBaseTemplate(
    "Your OTP Code",
    content,
    `Use ${otp} to verify your identity.`,
    `Go to ${websiteName}`,
    `${process.env.FRONTEND_URL}`
  );

  const mailOptions = {
    from: `"${websiteName}" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Your OTP for ${websiteName}`,
    html: htmlContent,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error(`Error sending OTP email to ${userEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user or login notification to existing user
 * @param {object} user - User object with name and email
 * @param {boolean} isNewUser - Whether this is a new user signup
 */
export const sendWelcomeEmail = async (user, isNewUser = false) => {
  try {
    const emailTransporter = getTransporter()
    if (!emailTransporter) return { success: false, error: "Email missing" }

    const userName = escapeHtml(user.name || user.email.split("@")[0])
    const userEmail = user.email

    const title = isNewUser ? "Welcome to the Community! 🎉" : "Secure Login Notification ✅";
    const preheader = isNewUser ? "We're excited to have you on board!" : "You've successfully logged in.";

    const content = isNewUser ? `
      <p style="margin-top: 0;">Hi ${userName} 👋,</p>
      <p>We're thrilled to have you join <strong>${websiteName}</strong>! Our platform is designed to help you master modern technologies through curated notes, interview prep, and learning paths.</p>
      
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
        <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 18px;">Ready to dive in? Here's where to start:</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding: 8px 0; font-size: 15px; color: #475569;">📚 <strong>Notes:</strong> Structured guides for all stacks.</td></tr>
          <tr><td style="padding: 8px 0; font-size: 15px; color: #475569;">💼 <strong>Interviews:</strong> Practice real-world questions.</td></tr>
          <tr><td style="padding: 8px 0; font-size: 15px; color: #475569;">🛣️ <strong>Roadmaps:</strong> Step-by-step learning paths.</td></tr>
        </table>
      </div>
      
      <p>Happy coding, and let's build something great together!</p>
    ` : `
      <p style="margin-top: 0;">Hi ${userName} 👋,</p>
      <p>This is a quick confirmation that you've just logged in to your account. We're keeping things secure for you!</p>
      
      <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 14px; color: #9a3412; text-align: left;">
        <strong>Security Notice:</strong> If this wasn't you, please change your password immediately and contact our support team.
      </div>
      
      <p>Head over to your dashboard to continue your learning journey.</p>
    `;

    const htmlContent = generateBaseTemplate(
      title,
      content,
      preheader,
      isNewUser ? "Explore My Dashboard →" : "Continue to Dashboard →",
      `${process.env.FRONTEND_URL}/dashboard`
    );

    const mailOptions = {
      from: `"${websiteName}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: isNewUser ? `Welcome to ${websiteName}!` : "Login Notification",
      html: htmlContent,
    }

    await emailTransporter.sendMail(mailOptions)
    return { success: true, email: userEmail }
  } catch (error) {
    console.error(`Error sending email to ${user?.email}:`, error.message);
    return { success: false, error: error.message }
  }
}

/**
 * Send notes upload notification
 * @param {object} note - Note object
 * @param {string} noteUrl - Direct URL to the notes
 */
export const sendNotesUploadNotification = async (note, noteUrl) => {
  if (!noteUrl) return { success: false, error: "URL required" }

  const content = ` 
    <p style="margin-top: 0;">Hello 👋,</p>
    <p>Fresh notes have just been uploaded to the platform! Keep your knowledge sharp with our latest documentation.</p>
    
    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
      <div class="badge" style="background-color: #8b5cf6; color: #ffffff;">New Resource</div>
      <h2 style="margin: 8px 0; font-size: 22px; color: #0f172a;">${escapeHtml(note.title || "New Notes Published")}</h2>
      <p style="margin: 8px 0; font-size: 15px; color: #64748b;">
        📘 <strong>Chapter:</strong> ${escapeHtml(note.chapter || "General")}<br/>
        🗂️ <strong>Category:</strong> ${escapeHtml(note.category || "Development")}
      </p>
      ${note.excerpt || note.description ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #475569; line-height: 1.6;">
        ${escapeHtml((note.excerpt || note.description || "").substring(0, 200))}${(note.excerpt || note.description || "").length > 200 ? "..." : ""}
      </div>` : ""}
    </div>
    
    <p style="font-size: 14px; color: #64748b; font-style: italic;">"Learning is the only thing the mind never exhausts, never fears, and never regrets."</p>
  `;

  const htmlContent = generateBaseTemplate(
    "New Notes Available",
    content,
    `Check out our latest notes on ${note.title || ''}.`,
    "Start Reading →",
    noteUrl
  );

  return await sendNotificationToUsers(`New Notes: ${note.title || "New Resource"}`, htmlContent)
}

/**
 * Send roadmap published notification
 * @param {object} roadmap - Roadmap object
 * @param {string} roadmapUrl - Direct URL to the roadmap
 */
export const sendRoadmapPublishedNotification = async (roadmap, roadmapUrl) => {
  const finalRoadmapUrl = roadmapUrl || (roadmap._id
    ? `${process.env.FRONTEND_URL}/roadmap/${roadmap._id}`
    : `${process.env.FRONTEND_URL}/roadmap`)

  const content = `
    <p style="margin-top: 0;">Hi learner 👋,</p>
    <p>A new learning roadmap has just been published! Master a new skill with our step-by-step career path.</p>
    
    <div style="background-color: #f1f5f9; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <div class="badge" style="background-color: #8b5cf6; color: #ffffff;">New Pathway</div>
      <h2 style="margin: 8px 0; font-size: 20px; color: #0f172a;">${escapeHtml(roadmap.title || "New Roadmap")}</h2>
      <p style="margin: 12px 0; font-size: 14px; color: #64748b;">
        ${escapeHtml(roadmap.description || "A comprehensive guide to mastering this stack.")}
      </p>
    </div>
    
    <p>Follow this guided approach to achieve your learning goals faster and more efficiently.</p>
  `;

  const htmlContent = generateBaseTemplate(
    "New Learning Path Available",
    content,
    `Start your journey with the new ${roadmap.title || ''} roadmap.`,
    "View Roadmap →",
    finalRoadmapUrl
  );

  return await sendNotificationToUsers(`New Roadmap: ${roadmap.title || "New Learning Path"}`, htmlContent)
}
