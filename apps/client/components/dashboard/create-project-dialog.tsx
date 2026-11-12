"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
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
import type { ProjectType } from "@/lib/types";

// Used in the dialog and inline in first-run onboarding. Creating a project
// also creates its Development and Production environments on the server.
export function CreateProjectForm({ inDialog = false, onDone }: { inDialog?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const toast = useToast();
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
      onDone?.();
      toast.show({
        tone: "success",
        title: `${project.name} created`,
        description: "It has a Development and a Production environment. You're viewing Development.",
      });
      router.push(`/dashboard/${project.slug}`);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code !== "VALIDATION_ERROR"
          ? err.message
          : "Couldn't create the project. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  const submit = (
    <Button disabled={pending} type="submit">
      {pending && <LoaderCircle className="animate-spin" />}
      {pending ? "Creating…" : "Create project"}
    </Button>
  );

  return (
    <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor={inDialog ? "project-name" : "onboarding-project-name"}>Name</Label>
        <Input
          aria-describedby={error ? "project-name-error" : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          autoFocus={inDialog}
          id={inDialog ? "project-name" : "onboarding-project-name"}
          maxLength={100}
          name="name"
          onChange={() => error && setError(null)}
          placeholder="e.g. Website redesign"
          required
        />
        {error ? (
          <p className="text-sm text-destructive" id="project-name-error" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">The project&apos;s URL slug is made from its name.</p>
        )}
      </div>

      <ProjectTypePicker name={inDialog ? "type" : "onboarding-type"} onChange={setType} value={type} />

      {inDialog ? (
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          {submit}
        </DialogFooter>
      ) : (
        <div className="flex justify-end">{submit}</div>
      )}
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
          <DialogDescription>Pick a name and a type. You can change both later in Settings.</DialogDescription>
        </DialogHeader>
        {/* Remounts on every open, so the form starts fresh */}
        {createDialogOpen && <CreateProjectForm inDialog onDone={() => setCreateDialogOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
