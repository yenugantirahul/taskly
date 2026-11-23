"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { ApiError, post } from "@/lib/api";

type SignupFormProps = {
  email: string;
  onEmailChange: (email: string) => void;
};

export function SignupForm({ email, onEmailChange }: SignupFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setPending(true);
    setError(null);
    try {
      const normalizedEmail = email.trim();
      await post("/auth/register", {
        name: form.get("name"),
        email: normalizedEmail,
        password: form.get("password"),
      });
      setSentTo(normalizedEmail);
      formElement.reset();
    } catch (err) {
      setError(getSignupError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {error && <FormMessage>{error}</FormMessage>}
      {sentTo && (
        <FormMessage tone="success">
          Almost there. We sent a verification link to <strong className="font-medium">{sentTo}</strong>. Open it,
          then log in.
        </FormMessage>
      )}
      <FormField
        autoComplete="name"
        id="signup-name"
        label="Full name"
        maxLength={100}
        name="name"
        placeholder="Alex Morgan"
        required
      />
      <FormField
        autoComplete="email"
        id="signup-email"
        label="Email"
        name="email"
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@company.com"
        required
        type="email"
        value={email}
      />
      <FormField
        autoComplete="new-password"
        id="signup-password"
        label="Password"
        maxLength={128}
        minLength={8}
        name="password"
        placeholder="At least 8 characters"
        required
        type="password"
      />
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}

function getSignupError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Couldn't create your account. Check your connection and try again.";
  }
  if (error.code !== "VALIDATION_ERROR") return error.message;

  const issue = Array.isArray(error.details) ? error.details[0] : null;
  const field =
    issue && typeof issue === "object" && Array.isArray(issue.path)
      ? issue.path[0]
      : null;

  if (field === "name") return "Enter your full name.";
  if (field === "email") return "Enter a valid email address, such as you@company.com.";
  if (field === "password") return "Password must be between 8 and 128 characters.";
  return "Please check your details and try again.";
}
