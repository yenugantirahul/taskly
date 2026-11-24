"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { CheckboxField } from "@/components/auth/checkbox-field";
import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { ApiError, post } from "@/lib/api";

type LoginFormProps = {
  email: string;
  onEmailChange: (email: string) => void;
};

export function LoginForm({ email, onEmailChange }: LoginFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    setCanResendVerification(false);
    setVerificationSent(false);
    try {
      await post("/auth/login", {
        email,
        password: form.get("password"),
        remember: form.get("remember") === "on",
      });
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setError("Your email isn't verified. Send a fresh link, then open it before logging in.");
        setCanResendVerification(true);
      } else {
        setError(err instanceof ApiError && err.code !== "VALIDATION_ERROR"
          ? err.message
          : "Invalid email or password");
      }
      setPending(false);
    }
  }

  async function handleResendVerification() {
    if (resending || !formRef.current) return;
    const form = new FormData(formRef.current);

    setResending(true);
    setError(null);
    try {
      await post("/auth/resend-verification", {
        email,
        password: form.get("password"),
      });
      setCanResendVerification(false);
      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof ApiError && err.code !== "VALIDATION_ERROR"
        ? err.message
        : "Enter your email and password again, then resend the link.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} ref={formRef}>
      {error && <FormMessage>{error}</FormMessage>}
      {verificationSent && (
        <FormMessage tone="success">
          Fresh verification link sent. Check your inbox, open the link, then log in.
        </FormMessage>
      )}
      <FormField
        autoComplete="email"
        id="login-email"
        label="Email"
        name="email"
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@company.com"
        required
        type="email"
        value={email}
      />
      <FormField
        autoComplete="current-password"
        id="login-password"
        label="Password"
        name="password"
        placeholder="Your password"
        required
        type="password"
      />
      <CheckboxField name="remember">Keep me signed in on this device</CheckboxField>
      {canResendVerification && (
        <button
          className="h-9 rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          disabled={resending}
          onClick={handleResendVerification}
          type="button"
        >
          {resending ? "Sending…" : "Send a fresh verification link"}
        </button>
      )}
      <SubmitButton pending={pending}>Log in</SubmitButton>
    </form>
  );
}
