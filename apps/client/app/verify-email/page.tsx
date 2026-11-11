import { Suspense } from "react";

import { VerifyEmail } from "@/components/auth/verify-email";
import { Logo } from "@/components/brand/logo";
import { ModeToggle } from "@/components/mode-toggle";

export default function VerifyEmailPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Logo />
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        {/* The token comes from the URL, which is only known at request time */}
        <Suspense fallback={<p className="text-sm text-muted-foreground">Verifying your email…</p>}>
          <VerifyEmail />
        </Suspense>
      </div>
    </main>
  );
}
