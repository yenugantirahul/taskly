import { and, desc, eq, like, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects } from "../db/schema/project.js";
import { ProjectResult } from "../types/projects.types.js";
import { CreateProjectInput, UpdateProjectInput } from "../validators/project.schema.js";
import { AppError } from "../utils/AppError.js";
import { nextAvailableSlug, slugify } from "../utils/slug.js";

// Columns returned to the client for every project endpoint.
const projectColumns = {
    id: projects.id,
    name: projects.name,
    slug: projects.slug,
    type: projects.type,
    createdAt: projects.createdAt,
    updatedAt: projects.updatedAt,
};

// Concurrent creates with the same name can pick the same slug; the unique
// index rejects all but one, and the losers retry with a fresh suffix.
const MAX_SLUG_ATTEMPTS = 3;

function isUniqueViolation(err: any): boolean {
    return (err?.cause?.code ?? err?.code) === "23505";
}

// Every lookup is scoped to the owner. Another user's project answers 404,
// the same as one that doesn't exist, so ids can't be probed.
function projectNotFound(): AppError {
    return new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
}

async function findTakenSlugs(ownerId: string, base: string): Promise<string[]> {
    // Slugs only contain [a-z0-9-], so LIKE wildcards (% and _) can't appear in `base`.
    const rows = await db
        .select({ slug: projects.slug })
        .from(projects)
        .where(
            and(
                eq(projects.ownerId, ownerId),
                or(eq(projects.slug, base), like(projects.slug, `${base}-%`)),
            ),
        );
    return rows.map((row) => row.slug);
}

// CREATE
export async function createProject(
    ownerId: string,
    input: CreateProjectInput,
): Promise<ProjectResult> {
    const base = slugify(input.name);

    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
        const slug = nextAvailableSlug(base, await findTakenSlugs(ownerId, base));

        try {
            const [project] = await db
                .insert(projects)
                .values({ name: input.name, type: input.type, slug, ownerId })
                .returning(projectColumns);

            return project;
        } catch (err) {
            if (!isUniqueViolation(err)) throw err;
            // Another request took this slug between our read and insert; try again.
        }
    }

    throw new AppError(
        409,
        "PROJECT_SLUG_CONFLICT",
        "Couldn't create the project right now. Please try again.",
    );
}

// READ (all of the caller's projects, newest first)
export async function listProjects(ownerId: string): Promise<ProjectResult[]> {
    return db
        .select(projectColumns)
        .from(projects)
        .where(eq(projects.ownerId, ownerId))
        .orderBy(desc(projects.createdAt));
}

// READ (one, by id)
export async function getProjectById(ownerId: string, id: string): Promise<ProjectResult> {
    const [project] = await db
        .select(projectColumns)
        .from(projects)
        .where(and(eq(projects.ownerId, ownerId), eq(projects.id, id)))
        .limit(1);

    if (!project) throw projectNotFound();
    return project;
}

// READ (one, by slug — for frontend URLs like /projects/my-website)
export async function getProjectBySlug(ownerId: string, slug: string): Promise<ProjectResult> {
    const [project] = await db
        .select(projectColumns)
        .from(projects)
        .where(and(eq(projects.ownerId, ownerId), eq(projects.slug, slug)))
        .limit(1);

    if (!project) throw projectNotFound();
    return project;
}

// UPDATE (rename and/or change slug; renaming alone keeps the slug)
export async function updateProject(
    ownerId: string,
    id: string,
    input: UpdateProjectInput,
): Promise<ProjectResult> {
    try {
        const [project] = await db
            .update(projects)
            .set(input)
            .where(and(eq(projects.ownerId, ownerId), eq(projects.id, id)))
            .returning(projectColumns);

        if (!project) throw projectNotFound();
        return project;
    } catch (err) {
        if (isUniqueViolation(err)) {
            throw new AppError(
                409,
                "PROJECT_SLUG_TAKEN",
                "You already have a project with this slug. Choose a different one.",
            );
        }
        throw err;
    }
}

// DELETE
export async function deleteProject(ownerId: string, id: string): Promise<void> {
    const [deleted] = await db
        .delete(projects)
        .where(and(eq(projects.ownerId, ownerId), eq(projects.id, id)))
        .returning({ id: projects.id });

    if (!deleted) throw projectNotFound();
}
