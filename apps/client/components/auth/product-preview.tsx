import { Check } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const tasks = [
  { label: "Morning walk, 10 min", time: "07:30", done: true },
  { label: "Reply to Priya's email", time: "09:00", done: true },
  { label: "Draft project outline", time: "11:00", done: true },
  { label: "Read 10 pages", time: "21:00", done: false },
];

// Static glimpse of the product: a day's triggers with progress and a streak
export function ProductPreview() {
  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <div className="w-full max-w-sm rounded-xl bg-card p-1 shadow-[0_1px_2px_rgba(12,12,11,0.04),0_12px_32px_-8px_rgba(12,12,11,0.12)] ring-1 ring-border">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
        <p className="text-sm font-medium">Today</p>
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          {doneCount} of {tasks.length} done
        </p>
      </div>

      <ul className="rounded-lg bg-muted/60 p-1">
        {tasks.map((task) => (
          <li className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm" key={task.label}>
            <span
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full",
                task.done ? "bg-primary text-primary-foreground" : "ring-1 ring-input ring-inset",
              )}
            >
              {task.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <span className={cn("flex-1", task.done && "text-muted-foreground line-through decoration-faint")}>
              {task.label}
            </span>
            <span className="font-mono text-[11px] text-faint">{task.time}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 px-3 pt-3 pb-2.5">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
        </div>
        <p className="flex items-center gap-1 font-mono text-[11px] text-brand-strong uppercase tracking-wider">
          <LogoMark className="size-3" />
          12-day streak
        </p>
      </div>
    </div>
  );
}
