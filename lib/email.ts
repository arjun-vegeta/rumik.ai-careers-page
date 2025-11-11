interface SendApplicationConfirmationParams {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  companyName?: string
}

export async function sendApplicationConfirmation({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName = "Rumik.ai",
}: SendApplicationConfirmationParams) {
  try {
    console.log("Attempting to send email to:", candidateEmail)
    console.log("Brevo API Key exists:", !!process.env.BREVO_API_KEY)
    console.log("Brevo Sender Email:", process.env.BREVO_SENDER_EMAIL)
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #000; margin-bottom: 20px;">Application Received!</h1>
            
            <p>Hi ${candidateName},</p>
            
            <p>Thank you for applying for the <strong>${jobTitle}</strong> position at ${companyName}.</p>
            
            <p>We've successfully received your application and our team will review it carefully. We'll get back to you soon with the next steps.</p>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #000;">
              <p style="margin: 0;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Our team will review your application</li>
                <li>We'll reach out if your profile matches our requirements</li>
                <li>You can expect to hear from us within 1-2 weeks</li>
              </ul>
            </div>
            
            <p>If you have any questions in the meantime, feel free to reply to this email.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>${companyName} Team</strong></p>
          </div>
          
          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
            This is an automated confirmation email. Please do not reply to this message.
          </p>
        </body>
      </html>
    `

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: companyName,
          email: process.env.BREVO_SENDER_EMAIL || "noreply@rumik.ai",
        },
        to: [
          {
            email: candidateEmail,
            name: candidateName,
          },
        ],
        subject: `Application Received - ${jobTitle}`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Brevo API error response:", response.status, errorData)
      return { success: false, error: errorData }
    }

    const responseData = await response.json()
    console.log("Email sent successfully! Response:", responseData)
    console.log("Application confirmation email sent to:", candidateEmail)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    // Don't throw error - we don't want email failures to break the application submission
    return { success: false, error }
  }
}
