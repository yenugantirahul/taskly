import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AuthShell>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-card">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link may be wrong, or the page has moved.</p>
        <div className="mt-6 grid gap-2">
          <Link className={buttonVariants()} href="/dashboard">
            Go to your projects
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/">
            Back to home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
