// Thin client for the Express API, reached through the same-origin /api proxy
// (see next.config.ts). The session lives in an HttpOnly cookie the browser
// sends automatically; no token is ever readable from JavaScript.

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? "Something went wrong. Please try again.",
    );
  }
  return body?.data as T;
}

export function post<T = unknown>(path: string, data?: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: data === undefined ? undefined : JSON.stringify(data) });
}
