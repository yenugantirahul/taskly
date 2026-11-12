"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import { type Environment, type EnvironmentType, isEnvironmentType } from "@/lib/types";

export const DEFAULT_ENVIRONMENT: EnvironmentType = "development";

// The selected environment lives in the URL (?env=production) so it survives
// reloads and can be shared. A missing or unknown value means development.
export function useSelectedEnvironment() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get("env");
  const selected: EnvironmentType = isEnvironmentType(param) ? param : DEFAULT_ENVIRONMENT;

  const select = useCallback(
    (type: EnvironmentType) => {
      const next = new URLSearchParams(searchParams);
      // Keep the default out of the URL so plain project links stay clean.
      if (type === DEFAULT_ENVIRONMENT) next.delete("env");
      else next.set("env", type);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { selected, select };
}

type EnvironmentsState =
  | { status: "loading" }
  | { status: "ready"; environments: Environment[] }
  | { status: "error"; error: ApiError };

export function useProjectEnvironments(projectId: string) {
  // Each result remembers which project it belongs to, so switching projects
  // shows loading instead of the previous project's environments.
  const [result, setResult] = useState<{ projectId: string; state: EnvironmentsState } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<Environment[]>(`/projects/${projectId}/environments`)
      .then((environments) => {
        if (!cancelled) setResult({ projectId, state: { status: "ready", environments } });
      })
      .catch((err) => {
        if (cancelled) return;
        const error = err instanceof ApiError ? err : new ApiError(0, "UNKNOWN_ERROR", "Couldn't load environments.");
        setResult({ projectId, state: { status: "error", error } });
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, attempt]);

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);

  const state: EnvironmentsState = result?.projectId === projectId ? result.state : { status: "loading" };
  return { state, retry };
}
