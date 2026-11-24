import { and, eq, isNull } from "drizzle-orm";

import { db } from "../db/index.js";
import { apiKeys } from "../db/schema/apikey.js";
import { environments } from "../db/schema/environment.js";
import { projects } from "../db/schema/project.js";
import { hashToken } from "../utils/Auth.js";

export interface DeveloperAuthentication {
  authenticated: true;
  apiKey: { id: string; name: string; keyPrefix: string };
  project: { id: string; name: string; slug: string };
  environment: { id: string; type: "development" | "production" };
}

export async function authenticateApiKey(key: string): Promise<DeveloperAuthentication | null> {
  const [scope] = await db
    .select({
      apiKeyId: apiKeys.id,
      apiKeyName: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      projectId: projects.id,
      projectName: projects.name,
      projectSlug: projects.slug,
      environmentId: environments.id,
      environmentType: environments.type,
    })
    .from(apiKeys)
    .innerJoin(projects, eq(projects.id, apiKeys.projectId))
    .innerJoin(
      environments,
      and(
        eq(environments.id, apiKeys.environmentId),
        eq(environments.projectId, apiKeys.projectId),
      ),
    )
    .where(and(eq(apiKeys.keyHash, hashToken(key)), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!scope) return null;

  return {
    authenticated: true,
    apiKey: { id: scope.apiKeyId, name: scope.apiKeyName, keyPrefix: scope.keyPrefix },
    project: { id: scope.projectId, name: scope.projectName, slug: scope.projectSlug },
    environment: { id: scope.environmentId, type: scope.environmentType },
  };
}
