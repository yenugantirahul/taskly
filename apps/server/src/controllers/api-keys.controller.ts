import type { Request, Response } from "express";

import * as apiKeysService from "../services/api-keys.service.js";
import type { ApiKeyScopeParams } from "../validators/api-key.schema.js";

function ownerId(req: Request): string {
  return req.user!.id;
}

export async function listApi(req: Request<ApiKeyScopeParams>, res: Response) {
  const keys = await apiKeysService.listApiKeys(
    ownerId(req),
    req.params.projectId,
    req.params.environmentId,
  );
  res.status(200).json({ data: keys });
}

export async function create(req: Request<ApiKeyScopeParams>, res: Response) {
  const key = await apiKeysService.createApiKey(
    ownerId(req),
    req.params.projectId,
    req.params.environmentId,
    req.body,
  );
  res.status(201).json({ data: key });
}
