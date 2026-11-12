import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <span className="grid size-10 place-items-center rounded-lg border bg-muted/50 text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-sm font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
