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

// The slug is generated from the name on the server, so clients send only the name.
export const createProjectSchema = z.object({
  name: nameSchema,
});

// Renaming doesn't change the slug, so existing URLs keep working. The slug
// can still be changed on purpose by sending it explicitly.
export const updateProjectSchema = z
  .object({
    name: nameSchema,
    slug: slugSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const projectIdParamSchema = z.object({
  id: z.uuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
