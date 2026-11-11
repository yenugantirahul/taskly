"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    try {
      await post("/auth/login", {
        email,
        password: form.get("password"),
        remember: form.get("remember") === "on",
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError && err.code !== "VALIDATION_ERROR"
        ? err.message
        : "Invalid email or password");
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {error && <FormMessage>{error}</FormMessage>}
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
        action={
          <a className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" href="#forgot-password">
            Forgot password?
          </a>
        }
        autoComplete="current-password"
        id="login-password"
        label="Password"
        name="password"
        placeholder="Your password"
        required
        type="password"
      />
      <CheckboxField name="remember">Keep me signed in on this device</CheckboxField>
      <SubmitButton pending={pending}>Log in</SubmitButton>
    </form>
  );
}
