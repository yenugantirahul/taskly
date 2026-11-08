import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport(env.SMTP_URL);

export async function sendVerificationEmail(to: string, token: string) {
    const link = `${env.APP_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject: "Taskly: Verify your email",
        text: `Confirm your email by opening this link: ${link}`,
        html: `<p><a href="${link}">Verify your email</a></p>`,
    });
}
