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

export function Logo({ className }: { className?: string }) {
  return (
    <div aria-label="MiniTrigger" className={cn("flex items-center gap-2.5", className)} role="img">
      <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-[#ff7a35] to-[#e0531a] text-[#fffefa] shadow-[0_2px_8px_rgba(242,101,34,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]">
        <LogoMark className="size-5" />
      </span>
      {/* Wordmark: editorial serif "Mini" against a tight, heavy sans "Trigger" */}
      <span aria-hidden="true" className="flex items-baseline text-[19px] leading-none">
        <span className="font-serif text-[1.2em] tracking-[-0.01em] text-brand-strong italic pr-[0.08em]">Mini</span>
        <span className="font-semibold tracking-[-0.045em]">Trigger</span>
      </span>
    </div>
  );
}
