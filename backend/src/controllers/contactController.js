import transporter from "../config/nodemailer.js"
import { generateBaseTemplate } from "../utils/notificationService.js"

const websiteName = process.env.WEBSITE_NAME || "CodeSphere"
const frontendUrl = process.env.FRONTEND_URL || ""
const frontendBaseUrl = frontendUrl.replace(/\/$/, "")

// @desc    Handle contact/feedback form submission
// @route   POST /api/contact/send
// @access  Private (requires authentication)
export const sendContactEmail = async (req, res) => {
  try {
    const { message, subject = "Contact Form Submission" } = req.body
    const userEmail = req.user?.email // Get email from authenticated user
    const userName = req.user?.name || "User" // Get name from authenticated user

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        message: "Please provide a message",
      })
    }

    // Validate user is authenticated
    if (!userEmail) {
      return res.status(401).json({
        message: "You must be logged in to send a message",
      })
    }

    // Prepare email to admin
    const adminMailContent = `
      <p style="margin-top: 0;">You have received a new message from the contact form.</p>
      
      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
        <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">User Information</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding: 6px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong> ${escapeHtml(userName)}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 14px; color: #475569;"><strong>Email:</strong> <a href="mailto:${escapeHtml(userEmail)}" style="color: #6366f1; text-decoration: none;">${escapeHtml(userEmail)}</a></td></tr>
        </table>
      </div>

      <div style="background-color: #ffffff; border-left: 4px solid #6366f1; border-radius: 4px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0; border-left-width: 4px; text-align: left;">
        <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 14px; text-transform: uppercase;">Message</h3>
        <div style="color: #475569; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${escapeHtml(message)}</div>
      </div>

      <p style="font-size: 13px; color: #64748b; font-style: italic;">Reply directly to this email to contact the user.</p>
    `;

    const adminHtml = generateBaseTemplate(
      "New Contact Form Submission",
      adminMailContent,
      `New message from ${userName}`,
      "Go to Admin Dashboard",
      `${frontendBaseUrl}/admin`
    );

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `[Contact Form] ${subject} - ${userName}`,
      html: adminHtml,
      replyTo: userEmail,
      headers: { "X-Priority": "1" },
    }

    // Prepare confirmation email to user
    const userMailContent = `
      <p style="margin-top: 0;">Hi ${escapeHtml(userName)} 👋,</p>
      <p>Thank you for reaching out to us! We've received your message and our team will get back to you as soon as possible (usually within 24-48 hours).</p>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
        <h4 style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase;">Your Message Copy:</h4>
        <div style="color: #475569; font-size: 14px; line-height: 1.5; font-style: italic;">"${escapeHtml(message)}"</div>
      </div>
      
      <p>In the meantime, feel free to explore our latest tutorials and coding notes.</p>
    `;

    const userHtml = generateBaseTemplate(
      "Message Received!",
      userMailContent,
      "We've received your inquiry and will respond soon.",
      `Explore ${websiteName} →`,
      frontendBaseUrl
    );

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `We received your message - ${websiteName}`,
      html: userHtml,
    }

    // Send emails
    await transporter.sendMail(adminMailOptions)
    await transporter.sendMail(userMailOptions)

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll be in touch soon.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({
      message: error.message || "Failed to send message. Please try again later.",
    })
  }
}

// @desc    Send feedback
// @route   POST /api/contact/feedback
// @access  Private (requires authentication)
export const sendFeedback = async (req, res) => {
  try {
    const { feedbackType, subject, details } = req.body
    const userEmail = req.user?.email // Get email from authenticated user
    const userName = req.user?.name || "User"

    if (!feedbackType || !subject || !details) {
      return res.status(400).json({
        message: "Please provide feedback type, subject, and details",
      })
    }

    if (!userEmail) {
      return res.status(401).json({
        message: "You must be logged in to submit feedback",
      })
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER

    // Email content for admin
    const adminMailContent = `
      <p style="margin-top: 0;">A user has submitted new feedback regarding the platform.</p>
      
      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
        <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 16px; text-transform: uppercase;">Feedback Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding: 6px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0;"><strong>From:</strong> ${escapeHtml(userName)} (${escapeHtml(userEmail)})</td></tr>
          <tr><td style="padding: 6px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0;"><strong>Type:</strong> <span style="display:inline-block; padding: 2px 8px; background: #6366f1; color: #fff; border-radius: 4px; font-size: 11px;">${escapeHtml(feedbackType)}</span></td></tr>
          <tr><td style="padding: 6px 0; font-size: 14px; color: #475569;"><strong>Subject:</strong> ${escapeHtml(subject)}</td></tr>
        </table>
      </div>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
        <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 14px;">DETAILS</h3>
        <div style="color: #475569; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${escapeHtml(details)}</div>
      </div>
    `;

    const adminHtml = generateBaseTemplate(
      "New Feedback Submission",
      adminMailContent,
      `Feedback from ${userEmail}`,
      "View All Feedback",
      `${process.env.FRONTEND_URL}/admin/feedback`
    );

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `[${feedbackType}] ${subject}`,
      html: adminHtml,
      replyTo: userEmail,
    }

    // Send confirmation email to user
    const userMailContent = `
      <p style="margin-top: 0;">Hi ${escapeHtml(userName)} 👋,</p>
      <p>Thank you for sharing your feedback with us! Insights from our community help us make <strong>${websiteName}</strong> better for everyone.</p>
      
      <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 20px; margin: 24px 0; color: #065f46; text-align: left;">
        <strong>Feedback Type:</strong> ${escapeHtml(feedbackType)}<br/>
        <strong>Subject:</strong> ${escapeHtml(subject)}
      </div>
      
      <p>Our team reviews every piece of feedback we receive. We'll be in touch if we need more information!</p>
    `;

    const userHtml = generateBaseTemplate(
      "Feedback Received!",
      userMailContent,
      "Thanks for helping us improve!",
      "Back to Dashboard",
      `${frontendBaseUrl}/dashboard`
    );

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Feedback Received - ${websiteName}`,
      html: userHtml,
    }

    await transporter.sendMail(adminMailOptions)
    await transporter.sendMail(userMailOptions)

    res.status(200).json({
      success: true,
      message: "Thank you for your feedback!",
    })
  } catch (error) {
    console.error("Feedback error:", error)
    res.status(500).json({
      message: error.message || "Failed to send feedback. Please try again later.",
    })
  }
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
  if (!text) return ""
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
