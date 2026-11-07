"use client";

import type { FormEvent } from "react";

import { CheckboxField } from "@/components/auth/checkbox-field";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";

type LoginFormProps = {
  email: string;
  onEmailChange: (email: string) => void;
};

export function LoginForm({ email, onEmailChange }: LoginFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
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
          <a className="text-[13px] font-medium text-brand-strong hover:text-brand" href="#forgot-password">
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
      <SubmitButton>Log in</SubmitButton>
    </form>
  );
}
