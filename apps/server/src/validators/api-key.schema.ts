import { z } from "zod";

export const apiKeyScopeParamSchema = z.object({
  projectId: z.uuid(),
  environmentId: z.uuid(),
});

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export type ApiKeyScopeParams = z.infer<typeof apiKeyScopeParamSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
