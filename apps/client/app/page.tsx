import { AuthCard } from "@/components/auth/auth-card";
import { Logo } from "@/components/brand/logo";
import { ModeToggle } from "@/components/mode-toggle";

// Server Component: only AuthCard (tabs and forms) ships client-side JavaScript
export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Logo />
      <AuthCard />
    </main>
  );
}
