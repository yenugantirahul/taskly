"use client";

import { KeyRound, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { CopyButton, Timestamp } from "@/components/dashboard/data-display";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Panel } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError, post } from "@/lib/api";
import {
  type ApiKey,
  type CreatedApiKey,
  type Environment,
  environmentTypeMeta,
} from "@/lib/types";

type ApiKeysState =
  | { status: "loading" }
  | { status: "ready"; keys: ApiKey[] }
  | { status: "error"; error: ApiError };

export function ApiKeysPanel({
  projectId,
  environment,
}: {
  projectId: string;
  environment: Environment | null;
}) {
  const { signOut } = useDashboard();
  const [result, setResult] = useState<{ scope: string; state: ApiKeysState } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scope = environment ? `${projectId}:${environment.id}` : `${projectId}:loading`;

  useEffect(() => {
    if (!environment) return;
    let cancelled = false;
    const path = `/projects/${projectId}/environments/${environment.id}/api-keys`;

    api<ApiKey[]>(path)
      .then((keys) => {
        if (!cancelled) setResult({ scope, state: { status: "ready", keys } });
      })
      .catch((err) => {
        if (cancelled) return;
        const error =
          err instanceof ApiError
            ? err
            : new ApiError(0, "UNKNOWN_ERROR", "Couldn't load API keys.");
        setResult({ scope, state: { status: "error", error } });
        if (error.status === 401) void signOut();
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, environment, projectId, scope, signOut]);

  const state: ApiKeysState =
    result?.scope === scope ? result.state : { status: "loading" };
  const environmentLabel = environment
    ? environmentTypeMeta[environment.type].label
    : "selected environment";

  function addCreatedKey(created: CreatedApiKey) {
    setResult((current) => ({
      scope,
      state: {
        status: "ready",
        keys:
          current?.scope === scope && current.state.status === "ready"
            ? [created, ...current.state.keys]
            : [created],
      },
    }));
  }

  return (
    <>
      <Panel
        actions={
          <Button
            disabled={!environment || state.status === "error"}
            onClick={() => setDialogOpen(true)}
            size="sm"
          >
            <Plus />
            Create key
          </Button>
        }
        description={`Keys created here can access only the ${environmentLabel} environment.`}
        title="API keys"
      >
        {state.status === "loading" && <ApiKeysSkeleton />}

        {state.status === "error" && state.error.status !== 401 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm" role="alert">
            <span className="text-destructive">{state.error.message}</span>
            <Button onClick={() => setAttempt((value) => value + 1)} size="sm" variant="outline">
              <RefreshCw />
              Try again
            </Button>
          </div>
        )}

        {state.status === "ready" && state.keys.length === 0 && (
          <EmptyState
            action={
              <Button onClick={() => setDialogOpen(true)} variant="outline">
                <Plus />
                Create API key
              </Button>
            }
            className="py-10"
            description={`Create a named key for tools that need access to ${environmentLabel}.`}
            icon={KeyRound}
            title="No API keys yet"
          />
        )}

        {state.status === "ready" && state.keys.length > 0 && (
          <ul className="divide-y">
            {state.keys.map((key) => (
              <li className="flex flex-wrap items-center gap-3 px-4 py-3" key={key.id}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted/50 text-muted-foreground">
                  <KeyRound className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span className="truncate">{key.name}</span>
                    <Badge variant={key.revokedAt ? "secondary" : "outline"}>
                      {key.revokedAt ? "Revoked" : "Active"}
                    </Badge>
                  </div>
                  <code className="block truncate font-mono text-xs text-muted-foreground">
                    {key.keyPrefix}••••••••
                  </code>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="block">Created</span>
                  <Timestamp value={key.createdAt} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {environment && (
        <CreateApiKeyDialog
          environment={environment}
          onCreated={addCreatedKey}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          projectId={projectId}
        />
      )}
    </>
  );
}

function ApiKeysSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading API keys" className="grid gap-3 p-4">
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
    </div>
  );
}

function CreateApiKeyDialog({
  projectId,
  environment,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  environment: Environment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: CreatedApiKey) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const environmentLabel = environmentTypeMeta[environment.type].label;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setPending(false);
      setError(null);
      setCreated(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) {
      setError("Give this key a name.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const key = await post<CreatedApiKey>(
        `/projects/${projectId}/environments/${environment.id}/api-keys`,
        { name },
      );
      setCreated(key);
      onCreated(key);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code !== "VALIDATION_ERROR"
          ? err.message
          : "Couldn't create the API key. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{created ? "Copy your API key" : "Create API key"}</DialogTitle>
          <DialogDescription>
            {created
              ? "This is the only time the complete key will be shown. Store it somewhere secure."
              : `Name the key that will access ${environmentLabel}.`}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <>
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-xs">{created.key}</code>
              <CopyButton label="API key" value={created.key} />
            </div>
            <p className="text-sm text-muted-foreground">
              For your security, only its prefix will appear after you close this dialog.
            </p>
            <DialogFooter>
              <DialogClose render={<Button />}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="api-key-name">Name</Label>
              <Input
                aria-describedby={error ? "api-key-name-error" : "api-key-name-help"}
                aria-invalid={error ? true : undefined}
                autoComplete="off"
                autoFocus
                id="api-key-name"
                maxLength={100}
                name="name"
                onChange={() => error && setError(null)}
                placeholder="e.g. Local CLI"
                required
              />
              {error ? (
                <p className="text-sm text-destructive" id="api-key-name-error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground" id="api-key-name-help">
                  Use a name that identifies the developer or integration using this key.
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button disabled={pending} type="submit">
                {pending && <LoaderCircle className="animate-spin" />}
                {pending ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
