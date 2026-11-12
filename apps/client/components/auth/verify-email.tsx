"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { ApiError, post } from "@/lib/api";

type State = { status: "pending" } | { status: "done" } | { status: "error"; message: string };

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function VerifyEmail() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<State>(() =>
    token && TOKEN_PATTERN.test(token)
      ? { status: "pending" }
      : { status: "error", message: "This verification link is invalid." },
  );
  // Tokens are single-use; guard against React running the effect twice in dev.
  const sent = useRef(false);

  useEffect(() => {
    if (state.status !== "pending" || sent.current || !token) return;
    sent.current = true;
    post("/auth/verify-email", { token })
      .then(() => setState({ status: "done" }))
      .catch((err) =>
        setState({
          status: "error",
          message: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        }),
      );
  }, [state.status, token]);

  if (state.status === "pending") {
    return (
      <p aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="size-4 animate-spin" />
        Verifying your email…
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        {state.status === "done" ? "Email verified" : "Couldn't verify email"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {state.status === "done"
          ? "Your account is ready. Log in to create your first project."
          : `${state.message} If your email isn't verified yet, sign up again with the same address to get a fresh link.`}
      </p>
      <Link className={buttonVariants({ className: "mt-6 w-full" })} href="/login">
        {state.status === "done" ? "Continue to log in" : "Back to log in"}
      </Link>
    </div>
  );
}
