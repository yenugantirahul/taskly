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

export const projectTypeMeta: Record<ProjectType, { label: string; description: string; icon: LucideIcon }> = {
  software: { label: "Software", description: "Ship features and fix bugs", icon: CodeXml },
  marketing: { label: "Marketing", description: "Plan campaigns and launches", icon: Megaphone },
  design: { label: "Design", description: "Track design work and reviews", icon: Palette },
  operations: { label: "Operations", description: "Run processes and requests", icon: BriefcaseBusiness },
  personal: { label: "Personal", description: "Habits, goals and errands", icon: Sprout },
};

// Mirrors environmentType in apps/server/src/db/schema/environment.ts, in the same order.
export const ENVIRONMENT_TYPES = ["development", "production"] as const;
export type EnvironmentType = (typeof ENVIRONMENT_TYPES)[number];

export type Environment = {
  id: string;
  type: EnvironmentType;
  createdAt: string;
};

export function isEnvironmentType(value: unknown): value is EnvironmentType {
  return (ENVIRONMENT_TYPES as readonly unknown[]).includes(value);
}

export const environmentTypeMeta: Record<EnvironmentType, { label: string; description: string; dot: string }> = {
  development: { label: "Development", description: "Work in progress, safe to change", dot: "bg-muted-foreground" },
  production: { label: "Production", description: "Live work your users see", dot: "bg-primary" },
};
