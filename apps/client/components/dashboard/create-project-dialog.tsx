"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
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
import { ApiError } from "@/lib/api";
import { PROJECT_TYPES, type ProjectType, projectTypeMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

function CreateProjectForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { createProject } = useDashboard();
  const [type, setType] = useState<ProjectType>("software");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) {
      setError("Give your project a name.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const project = await createProject({ name, type });
      onDone();
      router.push(`/dashboard/${project.slug}`);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code !== "VALIDATION_ERROR"
          ? err.message
          : "Couldn't create the project. Please try again.",
      );
      setPending(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="project-name">Name</Label>
        <Input
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          autoFocus
          id="project-name"
          maxLength={100}
          name="name"
          placeholder="e.g. Website redesign"
          required
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm leading-none font-medium">Type</legend>
        <div className="grid gap-1.5">
          {PROJECT_TYPES.map((option) => {
            const meta = projectTypeMeta[option];
            const checked = type === option;
            return (
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                  "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  checked ? "border-primary bg-accent" : "hover:bg-accent/60",
                )}
                key={option}
              >
                <input
                  checked={checked}
                  className="sr-only"
                  name="type"
                  onChange={() => setType(option)}
                  type="radio"
                  value={option}
                />
                <ProjectTypeIcon type={option} />
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{meta.description}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button disabled={pending} type="submit">
          {pending && <LoaderCircle className="animate-spin" />}
          Create project
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateProjectDialog() {
  const { createDialogOpen, setCreateDialogOpen } = useDashboard();

  return (
    <Dialog onOpenChange={setCreateDialogOpen} open={createDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Projects group related tasks. You can rename it later.</DialogDescription>
        </DialogHeader>
        {/* Remounts on every open, so the form starts fresh */}
        {createDialogOpen && <CreateProjectForm onDone={() => setCreateDialogOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
