import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ModeToggle } from "@/components/mode-toggle";

// Shared frame for /login, /signup and /verify-email
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Link aria-label="MiniTrigger home" className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href="/">
        <Logo />
      </Link>
      {children}
    </main>
  );
}
