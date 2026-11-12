import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign up | MiniTrigger",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <AuthCard initialMode="signup" />
    </AuthShell>
  );
}
