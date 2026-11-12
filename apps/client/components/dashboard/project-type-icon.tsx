import { cn } from "@/lib/utils";
import { type ProjectType, projectTypeMeta } from "@/lib/types";

export function ProjectTypeIcon({ type, className }: { type: ProjectType; className?: string }) {
  const { icon: Icon } = projectTypeMeta[type];
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-6 shrink-0 place-items-center rounded-md bg-muted text-foreground ring-1 ring-border ring-inset [&_svg]:size-3.5", className)}
    >
      <Icon />
    </span>
  );
}
