"use client";

import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
import { PROJECT_TYPES, type ProjectType, projectTypeMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

// Radio list of project types, shared by the create dialog and project settings.
export function ProjectTypePicker({
  value,
  onChange,
  name = "type",
}: {
  value: ProjectType;
  onChange: (type: ProjectType) => void;
  name?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm leading-none font-medium">Type</legend>
      <div className="grid gap-2">
        {PROJECT_TYPES.map((option) => {
          const meta = projectTypeMeta[option];
          const checked = value === option;
          return (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-150",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                checked ? "border-primary bg-accent" : "hover:bg-accent/60",
              )}
              key={option}
            >
              <input
                checked={checked}
                className="sr-only"
                name={name}
                onChange={() => onChange(option)}
                type="radio"
                value={option}
              />
              <ProjectTypeIcon type={option} />
              <span className="text-sm font-medium">{meta.label}</span>
              <span className="ml-auto hidden truncate text-sm text-muted-foreground sm:inline">{meta.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
