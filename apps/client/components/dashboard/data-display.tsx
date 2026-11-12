"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });
const fullFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long" });

// Dates read as data: monospace, tabular digits, full timestamp on hover.
export function Timestamp({ value, className }: { value: string; className?: string }) {
  const date = new Date(value);
  return (
    <time className={cn("font-mono text-xs tabular-nums", className)} dateTime={value} title={fullFormat.format(date)}>
      {dateFormat.format(date)}
    </time>
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 1500);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      // Clipboard access needs a secure context and permission.
      setState("failed");
    }
  }

  return (
    <Button
      aria-label={state === "copied" ? `${label} copied` : `Copy ${label}`}
      className="text-muted-foreground"
      onClick={copy}
      size="icon-xs"
      title={state === "failed" ? "Couldn't copy. Select the text instead." : `Copy ${label}`}
      type="button"
      variant="ghost"
    >
      {state === "copied" ? <Check className="text-success" /> : <Copy />}
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Copied" : state === "failed" ? "Couldn't copy" : ""}
      </span>
    </Button>
  );
}

// Monospace value with a copy button, for ids and slugs.
export function CopyValue({ value, label, display }: { value: string; label: string; display?: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <code className="truncate font-mono text-xs" title={value}>
        {display ?? value}
      </code>
      <CopyButton label={label} value={value} />
    </span>
  );
}

export function DetailList({ children }: { children: ReactNode }) {
  return <dl className="py-2">{children}</dl>;
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 px-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 justify-end text-right">{children}</dd>
    </div>
  );
}
