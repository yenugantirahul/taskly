import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmail } from "@/components/auth/verify-email";

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-card-foreground shadow-card">
        {/* The token comes from the URL, which is only known at request time */}
        <Suspense fallback={<p className="text-sm text-muted-foreground">Verifying your email…</p>}>
          <VerifyEmail />
        </Suspense>
      </div>
    </AuthShell>
  );
}
