import { and, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { apiKeys } from "../db/schema/apikey.js";
import { environments } from "../db/schema/environment.js";
import { projects } from "../db/schema/project.js";
import type { ApiKeyResult, CreatedApiKeyResult } from "../types/api-key.types.js";
import type { CreateApiKeyInput } from "../validators/api-key.schema.js";
import { AppError } from "../utils/AppError.js";
import { generateToken, hashToken } from "../utils/Auth.js";

const apiKeyColumns = {
  id: apiKeys.id,
  name: apiKeys.name,
  keyPrefix: apiKeys.keyPrefix,
  createdAt: apiKeys.createdAt,
  revokedAt: apiKeys.revokedAt,
};

function scopeNotFound(): AppError {
  // Project ownership and environment membership intentionally share one 404,
  // so callers cannot probe another user's resource ids.
  return new AppError(404, "API_KEY_SCOPE_NOT_FOUND", "Project environment not found");
}

async function getOwnedEnvironment(ownerId: string, projectId: string, environmentId: string) {
  const [environment] = await db
    .select({ type: environments.type })
    .from(projects)
    .innerJoin(
      environments,
      and(eq(environments.projectId, projects.id), eq(environments.id, environmentId)),
    )
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId)))
    .limit(1);

  if (!environment) throw scopeNotFound();
  return environment;
}

export async function listApiKeys(
  ownerId: string,
  projectId: string,
  environmentId: string,
): Promise<ApiKeyResult[]> {
  await getOwnedEnvironment(ownerId, projectId, environmentId);

  return db
    .select(apiKeyColumns)
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.userId, ownerId),
        eq(apiKeys.projectId, projectId),
        eq(apiKeys.environmentId, environmentId),
      ),
    )
    .orderBy(desc(apiKeys.createdAt));
}

export async function createApiKey(
  ownerId: string,
  projectId: string,
  environmentId: string,
  input: CreateApiKeyInput,
): Promise<CreatedApiKeyResult> {
  const environment = await getOwnedEnvironment(ownerId, projectId, environmentId);
  const environmentPrefix = environment.type === "production" ? "live" : "dev";
  const key = `mt_${environmentPrefix}_${generateToken()}`;

  const [created] = await db
    .insert(apiKeys)
    .values({
      userId: ownerId,
      projectId,
      environmentId,
      name: input.name,
      keyHash: hashToken(key),
      keyPrefix: key.slice(0, 15),
    })
    .returning(apiKeyColumns);

  return { ...created, key };
}
