import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log in | MiniTrigger",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthCard initialMode="login" />
    </AuthShell>
  );
}
