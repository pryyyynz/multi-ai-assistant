"use server"

interface EmailData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendFeedbackEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    // Simple email validation
    if (!data.email.includes("@")) {
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Prepare data for EmailJS
    const emailData = {
      service_id: process.env.EMAIL_SERVICE_ID,
      template_id: process.env.EMAIL_TEMPLATE_ID,
      user_id: process.env.EMAIL_PUBLIC_KEY,
      accessToken: process.env.EMAIL_PRIVATE_KEY,
      template_params: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    }

    // Send email using EmailJS API
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to send email: ${errorData}`)
    }

    return {
      success: true,
      message: "Thank you for your feedback! We'll get back to you soon.",
    }
  } catch (error: any) {
    console.error("Email sending error:", error)
    return {
      success: false,
      message: error.message || "Failed to send feedback. Please try again.",
    }
  }
}
