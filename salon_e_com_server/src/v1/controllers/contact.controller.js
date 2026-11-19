import { sendContactEmail } from "../utils/email.util.js";


export const sendContactInquiry = async (req, res) => {
    try {
        const { name, email, subject, message, toEmail } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, email, message)."
            });
        }

        const result = await sendContactEmail({ name, email, subject, message, toEmail });

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send email. Please try again later.",
                error: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: "Your inquiry has been sent successfully. We will get back to you soon!",
            data: result.data
        });
    } catch (error) {
        console.error("Contact Form error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        });
    }
};
