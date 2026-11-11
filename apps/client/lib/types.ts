import { BriefcaseBusiness, CodeXml, Megaphone, Palette, Sprout, type LucideIcon } from "lucide-react";

export type User = {
  id: string;
  name: string | null;
  email: string;
};

// Mirrors PROJECT_TYPES in apps/server/src/validators/project.schema.ts.
export const PROJECT_TYPES = ["software", "marketing", "design", "operations", "personal"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export type Project = {
  id: string;
  name: string;
  slug: string;
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
};

export const projectTypeMeta: Record<ProjectType, { label: string; description: string; icon: LucideIcon; tint: string }> = {
  software: { label: "Software", description: "Ship features and fix bugs", icon: CodeXml, tint: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  marketing: { label: "Marketing", description: "Plan campaigns and launches", icon: Megaphone, tint: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  design: { label: "Design", description: "Track design work and reviews", icon: Palette, tint: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  operations: { label: "Operations", description: "Run processes and requests", icon: BriefcaseBusiness, tint: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  personal: { label: "Personal", description: "Habits, goals and errands", icon: Sprout, tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
};
