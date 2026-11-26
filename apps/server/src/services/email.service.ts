import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function sendVerificationEmail(to: string, token: string) {
    const link = new URL("/verify-email", env.APP_URL);
    link.searchParams.set("token", token);
    const message = {
        from: env.EMAIL_FROM,
        to: [to],
        subject: "Taskly: Verify your email",
        text: `Confirm your email by opening this link: ${link}`,
    };

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(10_000),
    });

    // Provider responses can contain recipient information; keep them out of logs.
    await response.body?.cancel();
    if (!response.ok) {
        console.error(`Email delivery failed (HTTP ${response.status})`);
        throw new AppError(503, "VERIFICATION_EMAIL_UNAVAILABLE",
            "We couldn't send your verification email. Try again from the login page, or contact support if this continues.");
    }
}
