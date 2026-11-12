"use client";

import { CircleCheck, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { PageBar, PageBody, Panel } from "@/components/dashboard/page-header";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { ProjectNotFound, useCurrentProject } from "@/components/dashboard/project-view";
import { ProjectTypePicker } from "@/components/dashboard/project-type-picker";
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
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import type { Project, ProjectType } from "@/lib/types";

// Same rule as slugSchema on the server.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError && err.code !== "VALIDATION_ERROR" ? err.message : fallback;
}

export function ProjectSettings({ slug }: { slug: string }) {
  const current = useCurrentProject(slug);
  // Set while a slug change or delete is navigating away, so the old URL
  // shows a skeleton instead of flashing "not found".
  const [leaving, setLeaving] = useState(false);

  if (current.status === "loading" || (current.status === "missing" && leaving)) return <PageSkeleton />;
  if (current.status === "missing") return <ProjectNotFound />;

  return (
    <>
      <PageBar
        crumbs={[
          { label: "Projects", href: "/dashboard" },
          { label: current.project.name, href: `/dashboard/${current.project.slug}` },
        ]}
        title="Settings"
      />
      <PageBody>
        <div className="grid max-w-3xl gap-4">
          <GeneralForm key={current.project.id} onLeaving={setLeaving} project={current.project} />
          <DangerZone onLeaving={setLeaving} project={current.project} />
        </div>
      </PageBody>
    </>
  );
}

function GeneralForm({ project, onLeaving }: { project: Project; onLeaving: (leaving: boolean) => void }) {
  const router = useRouter();
  const { updateProject } = useDashboard();
  const toast = useToast();
  const [name, setName] = useState(project.name);
  const [slug, setSlug] = useState(project.slug);
  const [type, setType] = useState<ProjectType>(project.type);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const trimmedName = name.trim();
  const slugValid = SLUG_PATTERN.test(slug) && slug.length <= 64;
  const changes = {
    ...(trimmedName !== project.name && { name: trimmedName }),
    ...(slug !== project.slug && { slug }),
    ...(type !== project.type && { type }),
  };
  const dirty = Object.keys(changes).length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !dirty) return;
    if (!trimmedName) return setResult({ tone: "error", message: "Give your project a name." });
    if (!slugValid) {
      return setResult({ tone: "error", message: "Slugs use lowercase letters, numbers and single hyphens, like my-project." });
    }

    setPending(true);
    setResult(null);
    const movingTo = changes.slug;
    if (movingTo) onLeaving(true);
    try {
      const updated = await updateProject(project.id, changes);
      toast.show({
        tone: "success",
        title: "Changes saved",
        description: movingTo ? `${updated.name} now lives at /dashboard/${updated.slug}.` : undefined,
      });
      if (movingTo) router.replace(`/dashboard/${updated.slug}/settings`);
    } catch (err) {
      onLeaving(false);
      setResult({ tone: "error", message: errorMessage(err, "Couldn't save your changes. Check the fields and try again.") });
    } finally {
      setPending(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Panel
        description="The name and type show across the dashboard. The slug is the project's address."
        footer={
          <>
            {result && (
              <p
                className={result.tone === "error" ? "mr-auto text-sm text-destructive" : "mr-auto flex items-center gap-2 text-sm text-success"}
                role={result.tone === "error" ? "alert" : "status"}
              >
                {result.tone === "success" && <CircleCheck className="size-4" />}
                {result.message}
              </p>
            )}
            <Button
              disabled={!dirty || pending}
              onClick={() => {
                setName(project.name);
                setSlug(project.slug);
                setType(project.type);
                setResult(null);
              }}
              type="button"
              variant="ghost"
            >
              Discard
            </Button>
            <Button disabled={!dirty || pending} type="submit">
              {pending && <LoaderCircle className="animate-spin" />}
              Save changes
            </Button>
          </>
        }
        title="General"
      >
        <div className="grid gap-6 p-4">
          <div className="grid gap-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              aria-invalid={!trimmedName || undefined}
              autoComplete="off"
              id="settings-name"
              maxLength={100}
              onChange={(event) => {
                setName(event.target.value);
                setResult(null);
              }}
              value={name}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-slug">Slug</Label>
            <div className="flex min-w-0 items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
              <span className="hidden shrink-0 border-r px-3 font-mono text-xs text-muted-foreground sm:inline">/dashboard/</span>
              <input
                aria-describedby="settings-slug-hint"
                aria-invalid={!slugValid || undefined}
                autoCapitalize="off"
                autoComplete="off"
                className="h-8 min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
                id="settings-slug"
                maxLength={64}
                onChange={(event) => {
                  setSlug(event.target.value.toLowerCase());
                  setResult(null);
                }}
                spellCheck={false}
                value={slug}
              />
            </div>
            <p className={slugValid ? "text-sm text-muted-foreground" : "text-sm text-destructive"} id="settings-slug-hint">
              {slugValid
                ? "Renaming keeps the slug. Changing the slug moves the project to a new URL, and old links stop working."
                : "Use lowercase letters, numbers and single hyphens, like my-project."}
            </p>
          </div>

          <ProjectTypePicker onChange={(next) => { setType(next); setResult(null); }} value={type} />
        </div>
      </Panel>
    </form>
  );
}

function DangerZone({ project, onLeaving }: { project: Project; onLeaving: (leaving: boolean) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Panel
      className="border-destructive/40"
      description="Deleting removes the project and its Development and Production environments for good."
      title="Delete project"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">This can&apos;t be undone.</p>
        <Button onClick={() => setOpen(true)} variant="destructive">
          <Trash2 />
          Delete project
        </Button>
      </div>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {project.name}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the project and its environments. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          {open && <DeleteForm onLeaving={onLeaving} project={project} />}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function DeleteForm({ project, onLeaving }: { project: Project; onLeaving: (leaving: boolean) => void }) {
  const router = useRouter();
  const { deleteProject } = useDashboard();
  const toast = useToast();
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = confirm.trim() === project.slug;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matches || pending) return;
    setPending(true);
    setError(null);
    onLeaving(true);
    try {
      await deleteProject(project.id);
      toast.show({ tone: "success", title: `${project.name} deleted`, description: "The project and its environments are gone." });
      router.replace("/dashboard");
    } catch (err) {
      onLeaving(false);
      setError(errorMessage(err, "Couldn't delete the project. Try again in a moment."));
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="delete-confirm">
          Type <code className="rounded-sm bg-muted px-1 font-mono">{project.slug}</code> to confirm
        </Label>
        <Input
          autoCapitalize="off"
          autoComplete="off"
          autoFocus
          className="font-mono"
          id="delete-confirm"
          onChange={(event) => setConfirm(event.target.value)}
          spellCheck={false}
          value={confirm}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button disabled={!matches || pending} type="submit" variant="destructive">
          {pending && <LoaderCircle className="animate-spin" />}
          Delete project
        </Button>
      </DialogFooter>
    </form>
  );
}
