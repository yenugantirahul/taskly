import { cn } from "@/lib/utils";

// Inline status line for forms. role="alert" announces errors to screen readers.
export function FormMessage({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm",
        tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-success/30 bg-success/10 text-success",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
