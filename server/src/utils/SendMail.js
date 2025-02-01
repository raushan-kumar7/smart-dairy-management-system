import dotenv from "dotenv";
import nm from "nodemailer";
import { ApiError } from "./ApiError.js";

dotenv.config();

const transporter = nm.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async (options) => {
  const { email, subject, content } = options;

  try {
    await transporter.sendMail({
      from: `"Smart Dairy Management System" <no-reply@yourdomain.com>`,
      to: email,
      subject,
      html: content,
    });
  } catch (error) {
    throw new ApiError(500, `Error sending email: ${error.message}`);
  }
};

export const getPasswordResetMailContent = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You have requested to reset your password. Click the button below to proceed:</p>

        <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" target="_blank" rel="noopener noreferrer"
                style="background-color: #4CAF50; color: white; padding: 12px 20px; 
                      font-size: 16px; font-weight: bold; text-decoration: none; 
                      border-radius: 5px; display: inline-block;">
                Reset Password
            </a>
        </div>

        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p style="word-wrap: break-word;"><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>

        <p>This link will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; font-size: 12px; color: #666;">
            Best regards,<br><strong>Smart Dairy Management System, Technical Team</strong>
        </p>
    </div>
  `;
};
