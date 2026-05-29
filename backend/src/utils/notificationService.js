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
    console.error("Email credentials not configured. EMAIL_USER and EMAIL_PASSWORD must be set in .env")
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
    console.error("Failed to create email transporter:", error.message)
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
  const finalCtaUrl = ctaUrl || frontendBaseUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset & Base */
    body { margin: 0; padding: 0; min-width: 100%; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    table { border-spacing: 0; border-collapse: collapse; width: 100%; }
    img { border: 0; -ms-interpolation-mode: bicubic; }
    
    /* Layout */
    .wrapper { background-color: #f9fafb; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    
    /* Header */
    .header { background-color: #ffffff; padding: 32px; border-bottom: 1px solid #f3f4f6; text-align: center; }
    .logo { color: #4f46e5; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: -0.025em; }
    
    /* Body content */
    .content { padding: 40px; color: #374151; font-size: 16px; line-height: 1.6; }
    .hero { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; margin-bottom: 32px; border-radius: 8px; color: #ffffff; text-align: center; }
    .hero h1 { margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; }
    
    /* Components */
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
    .divider { border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0; }
    
    /* Footer */
    .footer { background-color: #f9fafb; padding: 32px; text-align: center; color: #6b7280; font-size: 14px; }
    .social-links { margin-bottom: 16px; }
    .social-links a { color: #9ca3af; text-decoration: none; margin: 0 8px; font-size: 13px; }
    
    /* Utility */
    .text-primary { color: #4f46e5; }
    .font-bold { font-weight: 700; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${frontendBaseUrl}" class="logo">${websiteName}</a>
      </div>
      
      <div class="content">
        <div class="hero">
          <h1>${title}</h1>
        </div>
        
        ${content}
        
        ${ctaLabel ? `
        <div class="button-container">
          <a href="${finalCtaUrl}" class="button">${ctaLabel}</a>
        </div>` : ""}
        
        <div class="divider"></div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          Happy learning,<br>
          <span class="text-primary font-bold">The ${websiteName} Team</span>
        </p>
      </div>
      
      <div class="footer">
        <div class="social-links">
          <a href="${frontendBaseUrl}/notes">Explore Notes</a> &bull;
          <a href="${frontendBaseUrl}/interview">Interview Prep</a> &bull;
          <a href="${frontendBaseUrl}/roadmap">Roadmaps</a>
        </div>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${websiteName}. All rights reserved.</p>
        <p style="margin-top: 8px;">You're receiving this because you're a member of the ${websiteName} community.</p>
      </div>
    </div>
  </div>
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
    <p>Hi learner 👋,</p>
    <p>A brand new interview challenge has just been published! Sharpen your skills and stay ahead of the competition.</p>
    
    <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px; color: #111827; font-size: 18px;">${escapeHtml(question.question || "Today's Challenge")}</h3>
      <table width="100%">
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #6b7280;"><strong>Role:</strong> ${escapeHtml(question.roles?.join(", ") || "General")}</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #6b7280;"><strong>Difficulty:</strong> ${escapeHtml(question.difficulty || "Medium")}</td>
        </tr>
      </table>
      ${question.description ? `
      <p style="margin: 16px 0 0; font-size: 14px; color: #4b5563; font-style: italic; border-top: 1px solid #e5e7eb; padding-top: 16px;">
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

  return await sendNotificationToUsers(`New Interview Question - Interview Preparation`, htmlContent)
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
    <p style="text-align: center; color: #4b5563;">To finish logging in, please enter the following verification code:</p>
    <div style="text-align: center; margin: 40px 0;">
      <div style="display: inline-block; background-color: #f3f4f6; padding: 24px 48px; border-radius: 16px; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #111827; border: 2px solid #e5e7eb;">
        ${otp}
      </div>
    </div>
    <p style="text-align: center; font-size: 14px; color: #6b7280; max-width: 400px; margin: 0 auto;">
      This code is valid for <strong style="color: #111827;">10 minutes</strong>. 
      For security reasons, do not share this code with anyone.
    </p>
  `;

  const htmlContent = generateBaseTemplate(
    "Verify Your Identity",
    content,
    `Your verification code is ${otp}.`,
    "",
    ""
  );

  const mailOptions = {
    from: `"${websiteName}" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Verification Code: ${otp}`,
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
      <p>Hi ${userName} 👋,</p>
      <p>We're thrilled to have you join <strong>${websiteName}</strong>! Our platform is dedicated to helping you master technology through structured notes, real-world interview prep, and guided roadmaps.</p>
      
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px;">What's waiting for you:</h3>
        <table width="100%">
          <tr><td style="padding: 10px 0; font-size: 15px; color: #4b5563;">🚀 <strong>Accelerated Learning:</strong> Industry-standard notes.</td></tr>
          <tr><td style="padding: 10px 0; font-size: 15px; color: #4b5563;">💼 <strong>Interview Edge:</strong> Curated Q&A from top companies.</td></tr>
          <tr><td style="padding: 10px 0; font-size: 15px; color: #4b5563;">🗺️ <strong>Step-by-Step Path:</strong> Visual roadmaps for your career.</td></tr>
        </table>
      </div>
      
      <p>We can't wait to see what you'll achieve. Let's get started!</p>
    ` : `
      <p>Hi ${userName} 👋,</p>
      <p>This is a quick security confirmation that you've just logged in to your account. We're keeping things secure for you!</p>
      
      <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 20px; margin: 32px 0; text-align: left;">
        <p style="margin: 0; font-size: 14px; color: #854d0e; line-height: 1.5;">
          <strong>Security Notice:</strong> If this log-in wasn't performed by you, please protect your account by changing your password immediately.
        </p>
      </div>
      
      <p>Ready to continue? Your dashboard is updated with the latest resources.</p>
    `;

    const htmlContent = generateBaseTemplate(
      title,
      content,
      preheader,
      isNewUser ? "Get Started Now →" : "Go to Dashboard →",
      `${process.env.FRONTEND_URL}/dashboard`
    );

    const mailOptions = {
      from: `"${websiteName}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: isNewUser ? `Welcome to ${websiteName}!` : "Security Alert: New Login",
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
    <p>Hello 👋,</p>
    <p>Exciting news! We've just published new notes on the platform. Keep your skills sharp and stay updated with the latest industry documentation.</p>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 28px; margin: 32px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 16px; font-size: 22px; color: #111827;">${escapeHtml(note.title || "New Resource Published")}</h2>
      <table width="100%" style="font-size: 15px; color: #6b7280;">
        <tr>
          <td style="padding-bottom: 8px;">📘 <strong>Chapter:</strong> ${escapeHtml(note.chapter || "General")}</td>
        </tr>
        <tr>
          <td>🗂️ <strong>Category:</strong> ${escapeHtml(note.category || "Development")}</td>
        </tr>
      </table>
      ${note.excerpt || note.description ? `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #4b5563; line-height: 1.6; font-style: italic;">
        "${escapeHtml((note.excerpt || note.description || "").substring(0, 180))}${(note.excerpt || note.description || "").length > 180 ? "..." : ""}"
      </div>` : ""}
    </div>
    
    <p style="font-size: 14px; color: #6b7280; text-align: center;">Get ahead by diving into these resources today.</p>
  `;

  const htmlContent = generateBaseTemplate(
    "New Notes Available",
    content,
    `Explore the latest notes on ${note.title || 'a new topic'}.`,
    "Start Reading →",
    noteUrl
  );

  return await sendNotificationToUsers(`New Notes Published: ${note.title || "New Resource"}`, htmlContent)
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
    <p>Hi learner 👋,</p>
    <p>We've just released a comprehensive learning roadmap! Master your next stack with a structured, step-by-step career path.</p>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 28px; margin: 32px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 12px; font-size: 22px; color: #111827;">${escapeHtml(roadmap.title || "Career Roadmap")}</h2>
      <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
        ${escapeHtml(roadmap.description || "A detailed guide designed to take you from beginner to job-ready in this technology.")}
      </p>
    </div>
    
    <p>Visualizing your progress is the best way to stay motivated. Check out the path we've mapped out for you!</p>
  `;

  const htmlContent = generateBaseTemplate(
    "New Learning Path Available",
    content,
    `Master ${roadmap.title || 'a new skill'} with our latest roadmap.`,
    "View Roadmap →",
    finalRoadmapUrl
  );

  return await sendNotificationToUsers(`New Roadmap: ${roadmap.title || "New Learning Path"}`, htmlContent)
}
