import { ListTodo, Settings, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import {
  CreateProjectPreview,
  DashboardPreview,
  OverviewPreview,
  SessionPreview,
  SignupPreview,
  SwitcherPreview,
  ThemePreview,
} from "@/components/landing/product-visuals";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Type sizes on this page: display (h1), title (h2), base (body), sm (UI and visuals).

const sections = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#whats-next", label: "What's next" },
];

const ctaLarge = "h-10 px-4 text-sm";

function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 md:px-6">
        <Link aria-label="MiniTrigger home" className="mr-4 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href="/">
          <Logo />
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {sections.map(({ href, label }) => (
            <li key={href}>
              <a className={buttonVariants({ variant: "ghost", className: "text-muted-foreground" })} href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Link className={buttonVariants({ variant: "ghost" })} href="/login">
            Log in
          </Link>
          <Link className={buttonVariants()} href="/signup">
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SectionHeading({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-sm text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 text-title font-semibold" id={id}>
        {title}
      </h2>
      {children && <p className="mt-4 text-base text-muted-foreground">{children}</p>}
    </div>
  );
}

const steps = [
  {
    title: "Create your account",
    body: "Sign up with your name, email and a password. We email you a verification link; open it, then log in.",
    visual: <SignupPreview />,
  },
  {
    title: "Create a project and pick its type",
    body: "Name it and choose Software, Marketing, Design, Operations or Personal. You can rename it later.",
    visual: <CreateProjectPreview />,
  },
  {
    title: "Open it at its own address",
    body: "Each project gets a slug from its name and a page at /dashboard/your-slug, so you can bookmark it and land straight there.",
    visual: <OverviewPreview />,
  },
];

const features = [
  {
    title: "Tell your projects apart at a glance",
    body: "Each project carries its type and icon everywhere it appears. The switcher at the top of the sidebar lists them all, marks the one you're in, and creates a new one from the same menu.",
    visual: <SwitcherPreview />,
  },
  {
    title: "Stay signed in only where you choose",
    body: "Your session lives in an HttpOnly cookie that page scripts can't read, sent only over HTTPS in production. Leave \"Keep me signed in\" off and it ends when you close the browser. Logging out revokes it on the server, and requests from other sites are rejected.",
    visual: <SessionPreview />,
  },
  {
    title: "Work in light or dark",
    body: "Dark by default. Switch to light, or follow your system setting, from the account menu at the bottom of the sidebar.",
    visual: <ThemePreview />,
  },
];

const upcoming = [
  { title: "Tasks", icon: ListTodo },
  { title: "Members", icon: Users },
  { title: "Settings", icon: Settings },
];

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        {/* Hero */}
        <section aria-labelledby="hero-title" className="mx-auto max-w-6xl px-4 pt-16 pb-16 md:px-6 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display font-semibold text-balance" id="hero-title">
              Every project you run, in one place
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground">
              For people juggling several kinds of work: give each software, marketing, design, operations or personal
              project its own space, and switch between them from one sidebar.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link className={buttonVariants({ className: ctaLarge })} href="/signup">
                Create your account
              </Link>
              <a className={buttonVariants({ variant: "outline", className: ctaLarge })} href="#how-it-works">
                See how it works
              </a>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-5xl md:mt-16">
            <DashboardPreview />
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-it-works" className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <SectionHeading eyebrow="How it works" id="how-it-works" title="From sign-up to your first project in three steps" />
            <ol className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-8">
              {steps.map((step, i) => (
                <li className="flex min-w-0 flex-col gap-4" key={step.title}>
                  <span className="grid size-8 place-items-center rounded-lg border font-mono text-sm">{i + 1}</span>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="text-base text-muted-foreground">{step.body}</p>
                  <div className="pt-2">{step.visual}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features" className="border-t">
          <div className="mx-auto grid max-w-6xl gap-16 px-4 py-16 md:px-6 md:py-24">
            <SectionHeading eyebrow="Features" id="features" title="What you get today" />
            {features.map((feature, i) => (
              <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16" key={feature.title}>
                <div className={cn("max-w-lg min-w-0", i % 2 === 1 && "lg:order-2")}>
                  <h3 className="text-title font-semibold">{feature.title}</h3>
                  <p className="mt-4 text-base text-muted-foreground">{feature.body}</p>
                </div>
                <div className="w-full min-w-0">{feature.visual}</div>
              </article>
            ))}
          </div>
        </section>

        {/* What's next */}
        <section aria-labelledby="whats-next" className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <SectionHeading eyebrow="What's next" id="whats-next" title="Coming to every project">
              These sections are already in the sidebar, marked &ldquo;Soon&rdquo;. They switch on as they ship.
            </SectionHeading>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {upcoming.map(({ title, icon: Icon }) => (
                <li className="flex items-center gap-3 rounded-xl border bg-card p-4 text-base" key={title}>
                  <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                  <span className="font-medium">{title}</span>
                  <span className="ml-auto text-sm text-muted-foreground">Soon</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section aria-labelledby="cta-title" className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-24">
            <div className="max-w-xl">
              <h2 className="text-title font-semibold" id="cta-title">
                Set up your first project
              </h2>
              <p className="mt-2 text-base text-muted-foreground">Create an account, verify your email, and pick a type.</p>
            </div>
            <Link className={buttonVariants({ className: ctaLarge })} href="/signup">
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <Logo />
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {sections.map(({ href, label }) => (
              <li key={href}>
                <a className="hover:text-foreground" href={href}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link className="hover:text-foreground" href="/login">
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
