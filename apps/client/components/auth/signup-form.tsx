"use client";

import type { FormEvent } from "react";

import { CheckboxField } from "@/components/auth/checkbox-field";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";

type SignupFormProps = {
  email: string;
  onEmailChange: (email: string) => void;
};

export function SignupForm({ email, onEmailChange }: SignupFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <FormField autoComplete="name" id="signup-name" label="Full name" name="name" placeholder="Alex Morgan" required />
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
        minLength={8}
        name="password"
        placeholder="At least 8 characters"
        required
        type="password"
      />
      <CheckboxField name="terms" required>
        I agree to the{" "}
        <a className="font-medium text-foreground underline decoration-input underline-offset-2 hover:decoration-foreground" href="#terms">
          Terms
        </a>{" "}
        and{" "}
        <a className="font-medium text-foreground underline decoration-input underline-offset-2 hover:decoration-foreground" href="#privacy">
          Privacy Policy
        </a>
      </CheckboxField>
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
