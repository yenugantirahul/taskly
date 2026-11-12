"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { CreateProjectForm } from "@/components/dashboard/create-project-dialog";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EnvironmentDot } from "@/components/dashboard/environment-switcher";
import { PageBar, PageBody, Panel } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "upcoming";

// Every step reflects real state: reaching the dashboard proves the account
// exists and its email is verified (login refuses unverified accounts).
const steps: { title: string; body: ReactNode; state: StepState }[] = [
  { title: "Create your account", body: "Done.", state: "done" },
  { title: "Verify your email", body: "Done. You can sign in from any device.", state: "done" },
  {
    title: "Create your first project",
    body: "Give it a name and a type. The name becomes its URL, like /dashboard/website-redesign.",
    state: "current",
  },
  {
    title: "Pick an environment",
    body: (
      <>
        Every project starts with <EnvironmentDot className="inline-block align-middle" type="development" /> Development and{" "}
        <EnvironmentDot className="inline-block align-middle" type="production" /> Production. Switch between them from the
        sidebar, under the project name.
      </>
    ),
    state: "upcoming",
  },
];

function StepMarker({ state, index }: { state: StepState; index: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs",
        state === "done" && "border-transparent bg-success/15 text-success",
        state === "current" && "border-primary text-foreground",
        state === "upcoming" && "text-muted-foreground",
      )}
    >
      {state === "done" ? <Check className="size-3.5" /> : index + 1}
    </span>
  );
}

export function Onboarding() {
  const { state } = useDashboard();
  const firstName = state.status === "ready" ? (state.user.name ?? "").split(/\s+/)[0] : "";
  const done = steps.filter((s) => s.state === "done").length;

  return (
    <>
      <PageBar title="Get started" />
      <PageBody>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{firstName ? `Welcome, ${firstName}` : "Welcome to MiniTrigger"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Set up your first project. It takes under a minute.</p>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[20rem_1fr]">
          <Panel title="Getting started" actions={<span className="font-mono text-xs text-muted-foreground">{done}/{steps.length}</span>}>
            <div
              aria-label={`${done} of ${steps.length} steps done`}
              aria-valuemax={steps.length}
              aria-valuemin={0}
              aria-valuenow={done}
              className="h-1 bg-muted"
              role="progressbar"
            >
              <div className="h-full bg-primary" style={{ width: `${(done / steps.length) * 100}%` }} />
            </div>
            <ol className="grid">
              {steps.map((step, i) => (
                <li
                  aria-current={step.state === "current" ? "step" : undefined}
                  className={cn("flex gap-3 px-4 py-4 not-last:border-b", step.state === "current" && "bg-accent/50")}
                  key={step.title}
                >
                  <StepMarker index={i} state={step.state} />
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", step.state === "done" && "text-muted-foreground line-through decoration-muted-foreground/50")}>
                      {step.title}
                      <span className="sr-only">
                        {step.state === "done" ? " (done)" : step.state === "current" ? " (current step)" : " (next)"}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel
            // On phones the action comes first; the checklist follows as context.
            className="order-first lg:order-none"
            description="A project is where one piece of work lives: an app you're shipping, a campaign, a design system, a process, or a personal goal."
            title="Create your first project"
          >
            <div className="p-4">
              <CreateProjectForm />
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}
