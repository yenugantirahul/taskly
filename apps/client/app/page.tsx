import { AuthCard } from "@/components/auth/auth-card";
import { AuthHero } from "@/components/auth/auth-hero";

// Server Component: only AuthCard (tabs and forms) ships client-side JavaScript
export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-360 flex-col lg:flex-row">
        <AuthHero />
        <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <AuthCard />
        </section>
      </div>
    </main>
  );
}
