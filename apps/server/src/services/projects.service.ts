import { and, eq, like, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects } from "../db/schema/project.js";
import { CreateProjectResult } from "../types/projects.types.js";
import { CreateProjectInput } from "../validators/project.schema.js";
import { AppError } from "../utils/AppError.js";
import { nextAvailableSlug, slugify } from "../utils/slug.js";

// Concurrent creates with the same name can pick the same slug; the unique
// index rejects all but one, and the losers retry with a fresh suffix.
const MAX_SLUG_ATTEMPTS = 3;

function isUniqueViolation(err: any): boolean {
    return (err?.cause?.code ?? err?.code) === "23505";
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

export async function createProject(
    userId: string,
    input: CreateProjectInput,
): Promise<CreateProjectResult> {
    const base = slugify(input.name);

    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
        const slug = nextAvailableSlug(base, await findTakenSlugs(userId, base));

        try {
            const [project] = await db
                .insert(projects)
                .values({ name: input.name, slug, ownerId: userId })
                .returning({
                    id: projects.id,
                    name: projects.name,
                    slug: projects.slug,
                });

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
