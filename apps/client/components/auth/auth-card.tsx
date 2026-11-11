"use client";

import { type ReactNode, useState } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const copy: Record<AuthMode, { title: string; description: string }> = {
  login: { title: "Welcome back", description: "Log in to pick up where you left off." },
  signup: { title: "Create your account", description: "Start building a routine that works for you." },
};

// Both panels stay mounted in one grid cell, so the card keeps the taller panel's height and never jumps.
// Not TabsContent: Base UI sets `hidden` on inactive panels, and Tailwind's base `[hidden]` rule is
// !important, which collapses the panel and brings the jump back.
function AuthPanel({ active, mode, children }: { active: boolean; mode: AuthMode; children: ReactNode }) {
  return (
    <div
      aria-labelledby={`auth-tab-${mode}`}
      className={cn(
        "col-start-1 row-start-1 transition-[opacity,translate,visibility] duration-200 ease-out",
        active ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0",
      )}
      id={`auth-panel-${mode}`}
      inert={!active}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

function PanelHeader({ mode }: { mode: AuthMode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight">{copy[mode].title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{copy[mode].description}</p>
    </div>
  );
}

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("login");
  // Shared so the address carries over when switching between log in and sign up
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <Tabs onValueChange={(value) => setMode(value as AuthMode)} value={mode}>
          <TabsList className="mb-6 w-full">
            <TabsTrigger aria-controls="auth-panel-login" id="auth-tab-login" value="login">
              Log in
            </TabsTrigger>
            <TabsTrigger aria-controls="auth-panel-signup" id="auth-tab-signup" value="signup">
              Sign up
            </TabsTrigger>
          </TabsList>

          <div className="grid">
            <AuthPanel active={mode === "login"} mode="login">
              <PanelHeader mode="login" />
              <LoginForm email={email} onEmailChange={setEmail} />
            </AuthPanel>
            <AuthPanel active={mode === "signup"} mode="signup">
              <PanelHeader mode="signup" />
              <SignupForm email={email} onEmailChange={setEmail} />
            </AuthPanel>
          </div>
        </Tabs>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signup" ? "Already have an account?" : "New to MiniTrigger?"}{" "}
        <button
          className="font-medium text-foreground underline underline-offset-4"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          type="button"
        >
          {mode === "signup" ? "Log in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
