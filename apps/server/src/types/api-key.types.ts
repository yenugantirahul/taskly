import { apiKeys } from "../db/schema/apikey.js";

// Hashes are server-only. A GET returns only safe identifying metadata.
export type ApiKeyResult = Pick<
  typeof apiKeys.$inferSelect,
  "id" | "name" | "keyPrefix" | "createdAt" | "revokedAt"
>;

// The complete key is added only to the response that creates it.
export type CreatedApiKeyResult = ApiKeyResult & { key: string };
