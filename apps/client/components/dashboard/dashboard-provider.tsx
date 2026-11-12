"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from "react";

import { api, ApiError, del, patch, post } from "@/lib/api";
import type { Project, ProjectType, User } from "@/lib/types";

// Mirrors updateProjectSchema on the server: any subset of these fields.
export type ProjectUpdate = Partial<{ name: string; slug: string; type: ProjectType }>;

type LoadState =
  | { status: "loading" }
  | { status: "ready"; user: User; projects: Project[] }
  | { status: "error"; message: string };

type DashboardContextValue = {
  state: LoadState;
  createProject: (input: { name: string; type: ProjectType }) => Promise<Project>;
  updateProject: (id: string, input: ProjectUpdate) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const value = use(DashboardContext);
  if (!value) throw new Error("useDashboard must be used within DashboardProvider");
  return value;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const signOut = useCallback(async () => {
    // Revokes the session server-side and clears the HttpOnly cookie. Even if
    // the request fails, leave the dashboard so nothing stale stays on screen.
    await post("/auth/logout").catch(() => {});
    router.replace("/");
    router.refresh();
  }, [router]);

  // Any 401 means the session expired or was revoked: sign out cleanly so the
  // proxy doesn't bounce us straight back here on a dead cookie.
  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        void signOut();
        return true;
      }
      return false;
    },
    [signOut],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([api<User>("/auth/me"), api<Project[]>("/projects")])
      .then(([user, projects]) => {
        if (!cancelled) setState({ status: "ready", user, projects });
      })
      .catch((err) => {
        if (cancelled || handleError(err)) return;
        setState({
          status: "error",
          message: err instanceof ApiError ? err.message : "Couldn't load your dashboard.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, handleError]);

  const createProject = useCallback(
    async (input: { name: string; type: ProjectType }) => {
      try {
        const project = await post<Project>("/projects", input);
        setState((prev) =>
          prev.status === "ready" ? { ...prev, projects: [project, ...prev.projects] } : prev,
        );
        return project;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError],
  );

  const updateProject = useCallback(
    async (id: string, input: ProjectUpdate) => {
      try {
        const project = await patch<Project>(`/projects/${id}`, input);
        setState((prev) =>
          prev.status === "ready"
            ? { ...prev, projects: prev.projects.map((p) => (p.id === id ? project : p)) }
            : prev,
        );
        return project;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        await del(`/projects/${id}`);
      } catch (err) {
        // Already gone counts as deleted; anything else is a real failure.
        if (!(err instanceof ApiError && err.status === 404)) {
          handleError(err);
          throw err;
        }
      }
      setState((prev) =>
        prev.status === "ready" ? { ...prev, projects: prev.projects.filter((p) => p.id !== id) } : prev,
      );
    },
    [handleError],
  );

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ state, createProject, updateProject, deleteProject, signOut, retry, createDialogOpen, setCreateDialogOpen }),
    [state, createProject, updateProject, deleteProject, signOut, retry, createDialogOpen],
  );

  return <DashboardContext value={value}>{children}</DashboardContext>;
}
