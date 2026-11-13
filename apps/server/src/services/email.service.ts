import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.SMTP_URL ? nodemailer.createTransport(env.SMTP_URL) : null;

export async function sendVerificationEmail(to: string, token: string) {
    const link = new URL("/verify-email", env.APP_URL);
    link.searchParams.set("token", token);
    const message = {
        from: env.EMAIL_FROM,
        to,
        subject: "Taskly: Verify your email",
        text: `Confirm your email by opening this link: ${link}`,
    };

    if (env.RESEND_API_KEY) {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...message, to: [to] }),
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) {
            // Provider responses can contain recipient information; keep them out of logs.
            await response.body?.cancel();
            throw new Error(`Email delivery failed (HTTP ${response.status})`);
        }
        await response.body?.cancel();
        return;
    }

    if (!transporter) throw new Error("Email delivery is not configured");
    await transporter.sendMail(message);
}
