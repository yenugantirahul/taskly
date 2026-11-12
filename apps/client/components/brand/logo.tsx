import { cn } from "@/lib/utils";

// Same bolt-and-spark mark as app/icon.svg, drawn in currentColor
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="8 6 52 52" fill="currentColor">
      <path d="M36 9 17.5 36H30l-3.5 19L46.5 27H34z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="48.5" cy="14.5" r="4" />
    </svg>
  );
}

export function LogoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground", className)}>
      <LogoMark className="size-4.5" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div aria-label="MiniTrigger" className={cn("flex items-center gap-2", className)} role="img">
      <LogoBadge className="size-7" />
      <span aria-hidden="true" className="text-base font-semibold tracking-tight">
        MiniTrigger
      </span>
    </div>
  );
}
