import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (data) => {
  const { name, email, subject, message, toEmail } = data;

  try {
    const result = await resend.emails.send({
      from: "GlowBShine Support <onboarding@resend.dev>", // replace with your domain later
      to: [toEmail],
      subject: subject || `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #ed8936;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return { success: false, error: error.message };
  }
};
