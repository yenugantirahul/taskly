export type EnvironmentType = "development" | "production";

export interface MiniTriggerConfig {
  /** The API key created in the MiniTrigger dashboard. */
  apiKey: string;
  /** The MiniTrigger server URL. Defaults to the local development server. */
  baseUrl?: string | undefined;
  /** Optional fetch implementation for runtimes that do not provide one. */
  fetch?: typeof globalThis.fetch | undefined;
}

export interface AuthenticationResult {
  authenticated: true;
  apiKey: {
    id: string;
    name: string;
    keyPrefix: string;
  };
  project: {
    id: string;
    name: string;
    slug: string;
  };
  environment: {
    id: string;
    type: EnvironmentType;
  };
}

interface ErrorEnvelope {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
}

interface DataEnvelope<T> {
  data?: T;
}

export class MiniTriggerError extends Error {
  override readonly name = "MiniTriggerError";

  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

/** The MiniTrigger SDK client. It currently exposes authentication only. */
export class MiniTrigger {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof globalThis.fetch;

  constructor(config: MiniTriggerConfig) {
    if (typeof config.apiKey !== "string" || config.apiKey.trim() === "") {
      throw new TypeError("MiniTrigger apiKey must be a non-empty string.");
    }

    const fetchImplementation = config.fetch ?? globalThis.fetch;
    if (typeof fetchImplementation !== "function") {
      throw new TypeError(
        "No fetch implementation is available. Pass one in the MiniTrigger configuration.",
      );
    }

    this.apiKey = config.apiKey.trim();
    this.baseUrl = normalizeBaseUrl(config.baseUrl ?? "http://localhost:5000");
    this.fetch = fetchImplementation;
  }

  /** Authenticate the configured API key and return its project scope. */
  async authenticate(options: { signal?: AbortSignal | undefined } = {}): Promise<AuthenticationResult> {
    let response: Response;

    try {
      response = await this.fetch(`${this.baseUrl}/api/developer/verify`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        ...(options.signal ? { signal: options.signal } : {}),
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw new MiniTriggerError(
        0,
        "NETWORK_ERROR",
        "Could not reach the MiniTrigger server.",
      );
    }

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const envelope = isRecord(body) ? (body as ErrorEnvelope) : undefined;
      const serverError = envelope?.error;
      throw new MiniTriggerError(
        response.status,
        typeof serverError?.code === "string" ? serverError.code : "UNKNOWN_ERROR",
        typeof serverError?.message === "string"
          ? serverError.message
          : "MiniTrigger authentication failed.",
        serverError?.details,
      );
    }

    const data = isRecord(body) ? (body as DataEnvelope<unknown>).data : undefined;
    if (!isAuthenticationResult(data)) {
      throw new MiniTriggerError(
        response.status,
        "INVALID_RESPONSE",
        "The MiniTrigger server returned an invalid authentication response.",
      );
    }

    return data;
  }

  /** Alias for authenticate(), useful for startup health checks. */
  verify(options: { signal?: AbortSignal | undefined } = {}): Promise<AuthenticationResult> {
    return this.authenticate(options);
  }
}

function normalizeBaseUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("MiniTrigger baseUrl must be a valid absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("MiniTrigger baseUrl must use http or https.");
  }

  return url.toString().replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthenticationResult(value: unknown): value is AuthenticationResult {
  if (!isRecord(value) || value.authenticated !== true) return false;
  if (!isRecord(value.apiKey) || !isRecord(value.project) || !isRecord(value.environment)) {
    return false;
  }

  return (
    typeof value.apiKey.id === "string" &&
    typeof value.apiKey.name === "string" &&
    typeof value.apiKey.keyPrefix === "string" &&
    typeof value.project.id === "string" &&
    typeof value.project.name === "string" &&
    typeof value.project.slug === "string" &&
    typeof value.environment.id === "string" &&
    (value.environment.type === "development" || value.environment.type === "production")
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

// Aliases for the original scaffold so early consumers do not break.
export { MiniTrigger as Taskly };
export type TasklyConfig = MiniTriggerConfig;
