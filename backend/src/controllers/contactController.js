import transporter from "../config/nodemailer.js"

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
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Message from Contact Form</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">User Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px 0; font-weight: bold; color: #555; width: 30%;">Name:</td>
                  <td style="padding: 10px 0; color: #333;">${escapeHtml(userName)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 10px 0; color: #333;">
                    <a href="mailto:${escapeHtml(userEmail)}" style="color: #667eea; text-decoration: none;">
                      ${escapeHtml(userEmail)}
                    </a>
                  </td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h2>
              <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; word-wrap: break-word; white-space: pre-wrap;">
                ${escapeHtml(message)}
              </div>
            </div>

            <div style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">
                <strong>Sent from:</strong> Coding Notes Platform Contact Form<br/>
                <strong>Date:</strong> ${new Date().toLocaleString()}<br/>
                <strong>Website:</strong> <a href="https://codenotes.dev" style="color: #667eea; text-decoration: none;">codenotes.dev</a>
              </p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 12px; margin-top: 20px; font-size: 13px; color: #856404;">
              <strong>⚠️ Quick Reply:</strong> You can reply directly to this email to contact the user at ${escapeHtml(userEmail)}
            </div>
          </div>
        </div>
      `,
      replyTo: userEmail,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
      },
    }

    // Prepare confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "We received your message - Coding Notes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Reaching Out!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
              Hi <strong>${escapeHtml(userName)}</strong>,
            </p>

            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              We've received your message and appreciate you taking the time to contact us. Our team will review your message and get back to you as soon as possible.
            </p>

            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; margin-bottom: 15px;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #999;">YOUR MESSAGE:</p>
              <p style="margin: 0; color: #333; word-wrap: break-word; white-space: pre-wrap;">
                ${escapeHtml(message)}
              </p>
            </div>

            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              <strong>Expected Response Time:</strong> Within 1-2 business days<br/>
              <strong>Response Email:</strong> <a href="mailto:support@codingnotes.dev" style="color: #667eea; text-decoration: none;">support@codingnotes.dev</a>
            </p>

            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 12px; margin-top: 20px; font-size: 13px; color: #004085;">
              <strong>💡 Tip:</strong> Keep this email for reference. You can reply to this email to add more information to your request.
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
              Best regards,<br/>
              <strong>Coding Notes Team</strong><br/>
              <a href="https://codenotes.dev" style="color: #667eea; text-decoration: none;">codenotes.dev</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
            <p>This is an automated response. Please do not reply to this email with additional information.</p>
          </div>
        </div>
      `,
    }

    // Send email to admin
    await transporter.sendMail(adminMailOptions)

    // Send confirmation email to user
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

// Helper function to escape HTML special characters
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// @desc    Send feedback
// @route   POST /api/contact/feedback
// @access  Private (requires authentication)
export const sendFeedback = async (req, res) => {
  try {
    const { feedbackType, subject, details } = req.body
    const userEmail = req.user?.email // Get email from authenticated user

    // Validate required fields
    if (!feedbackType || !subject || !details) {
      return res.status(400).json({
        message: "Please provide feedback type, subject, and details",
      })
    }

    // Validate user is authenticated
    if (!userEmail) {
      return res.status(401).json({
        message: "You must be logged in to submit feedback",
      })
    }

    // Admin email address
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER

    // Email content for admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `[${feedbackType}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Feedback Submission</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">User Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px 0; font-weight: bold; color: #555; width: 30%;">Email:</td>
                  <td style="padding: 10px 0; color: #333;">
                    <a href="mailto:${escapeHtml(userEmail)}" style="color: #667eea; text-decoration: none;">
                      ${escapeHtml(userEmail)}
                    </a>
                  </td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Feedback Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px 0; font-weight: bold; color: #555; width: 30%;">Type:</td>
                  <td style="padding: 10px 0; color: #333;">${escapeHtml(feedbackType)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px 0; font-weight: bold; color: #555;">Subject:</td>
                  <td style="padding: 10px 0; color: #333;">${escapeHtml(subject)}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Feedback Details</h2>
              <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; word-wrap: break-word; white-space: pre-wrap;">
                ${escapeHtml(details)}
              </div>
            </div>

            <div style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">
                <strong>Submitted from:</strong> Coding Notes Platform Feedback Form<br/>
                <strong>Date:</strong> ${new Date().toLocaleString()}<br/>
                <strong>Website:</strong> <a href="https://codenotes.dev" style="color: #667eea; text-decoration: none;">codenotes.dev</a><br/>
                <strong>Can Reply To:</strong> <a href="mailto:${escapeHtml(userEmail)}" style="color: #667eea; text-decoration: none;">${escapeHtml(userEmail)}</a>
              </p>
            </div>
          </div>
        </div>
      `,
      replyTo: userEmail,
    }

    // Send email to admin
    await transporter.sendMail(adminMailOptions)

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Feedback Received - Coding Notes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Feedback!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
              You have successfully submitted your feedback.
            </p>

            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              We appreciate you taking the time to share your ${escapeHtml(feedbackType.toLowerCase())} with us. Your feedback is valuable and helps us continuously improve CodeNotes.
            </p>

            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 15px; margin-bottom: 15px; font-size: 13px; color: #004085;">
              <strong>📋 Feedback Summary:</strong><br/>
              <strong>Type:</strong> ${escapeHtml(feedbackType)}<br/>
              <strong>Subject:</strong> ${escapeHtml(subject)}
            </div>

            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              <strong>Please wait for a reply.</strong> Our team will review your feedback and respond to you as soon as possible, typically within 1-2 business days.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
              Best regards,<br/>
              <strong>Coding Notes Team</strong><br/>
              <a href="https://codenotes.dev" style="color: #667eea; text-decoration: none;">codenotes.dev</a>
            </p>
          </div>
        </div>
      `,
    }

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
