import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug may only contain lowercase letters, numbers and single hyphens",
  );

const nameSchema = z.string().trim().min(1).max(100);

// Kept in sync with the project_type enum in db/schema/project.ts.
export const PROJECT_TYPES = ["software", "marketing", "design", "operations", "personal"] as const;
const typeSchema = z.enum(PROJECT_TYPES);

// The slug is generated from the name on the server, so clients send only the name and type.
export const createProjectSchema = z.object({
  name: nameSchema,
  type: typeSchema,
});

// Renaming doesn't change the slug, so existing URLs keep working. The slug
// can still be changed on purpose by sending it explicitly.
export const updateProjectSchema = z
  .object({
    name: nameSchema,
    slug: slugSchema,
    type: typeSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const projectIdParamSchema = z.object({
  id: z.uuid(),
});

export const projectSlugParamSchema = z.object({
  slug: slugSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type ProjectSlugParam = z.infer<typeof projectSlugParamSchema>;
