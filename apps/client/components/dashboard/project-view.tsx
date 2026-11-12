"use client";

import { FileQuestion, ListTodo, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { CopyValue, DetailList, DetailRow, Timestamp } from "@/components/dashboard/data-display";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/empty-state";
import { EnvironmentDot, EnvironmentSwitcher } from "@/components/dashboard/environment-switcher";
import { PageBar, PageBody, Panel } from "@/components/dashboard/page-header";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
import { useProjectEnvironments, useSelectedEnvironment } from "@/components/dashboard/use-environment";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type Environment, type EnvironmentType, environmentTypeMeta, type Project, projectTypeMeta } from "@/lib/types";

// Finds the project in the caller's own list, so another user's slug is
// simply "not found" here, matching the API's 404.
export function useCurrentProject(slug: string) {
  const { state } = useDashboard();
  if (state.status !== "ready") return { status: "loading" as const };
  const project = state.projects.find((p) => p.slug === slug);
  return project ? { status: "ready" as const, project } : { status: "missing" as const };
}

export function ProjectView({ slug }: { slug: string }) {
  const current = useCurrentProject(slug);
  if (current.status === "loading") return <PageSkeleton />;
  if (current.status === "missing") return <ProjectNotFound />;
  return <ProjectDetail project={current.project} />;
}

export function ProjectNotFound() {
  return (
    <>
      <PageBar crumbs={[{ label: "Projects", href: "/dashboard" }]} title="Not found" />
      <EmptyState
        action={
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">
            Back to projects
          </Link>
        }
        description="It may have been deleted, renamed to a new slug, or the link is wrong."
        icon={FileQuestion}
        title="Project not found"
      />
    </>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const { signOut } = useDashboard();
  const { state: envState, retry } = useProjectEnvironments(project.id);
  const { selected, select } = useSelectedEnvironment();

  const status = envState.status === "error" ? envState.error.status : null;
  // A dead session signs out, as everywhere else on the dashboard.
  useEffect(() => {
    if (status === 401) void signOut();
  }, [status, signOut]);

  // The project was deleted (or isn't ours) since the list was loaded.
  if (status === 404) return <ProjectNotFound />;

  const meta = projectTypeMeta[project.type];
  const environments = envState.status === "ready" ? envState.environments : null;
  const envLabel = environmentTypeMeta[selected].label;

  return (
    <>
      <PageBar
        actions={
          <>
            <Link
              aria-label="Project settings"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={`/dashboard/${project.slug}/settings`}
            >
              <Settings />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </>
        }
        badge={<Badge className="hidden sm:inline-flex" variant="secondary">{meta.label}</Badge>}
        crumbs={[{ label: "Projects", href: "/dashboard" }]}
        icon={<ProjectTypeIcon className="size-5 rounded-sm [&_svg]:size-3" type={project.type} />}
        title={project.name}
      />
      <PageBody>
        {/* Desktop picks the environment in the sidebar; phones, where the sidebar is a drawer, get it here. */}
        {envState.status !== "error" && (
          <div className="md:hidden">
            <EnvironmentSwitcher environments={environments} onSelect={select} selected={selected} />
          </div>
        )}

        {envState.status === "error" && status !== 401 && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
            role="alert"
          >
            <span>
              <span className="font-medium text-destructive">Couldn&apos;t load environments.</span>{" "}
              {envState.error.message}
            </span>
            <Button onClick={retry} size="sm" variant="outline">
              Try again
            </Button>
          </div>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
          <Panel
            actions={
              <Badge variant="outline">
                <EnvironmentDot type={selected} />
                {envLabel}
              </Badge>
            }
            title="Tasks"
          >
            <EmptyState
              description={`Tasks are on the way. When they ship, the tasks you add to ${envLabel} will show up here.`}
              icon={ListTodo}
              title="Tasks are coming soon"
            />
          </Panel>

          <div className="grid gap-4">
            <Panel title="Details">
              <DetailList>
                <DetailRow label="Type">{meta.label}</DetailRow>
                <DetailRow label="Slug">
                  <CopyValue label="slug" value={project.slug} />
                </DetailRow>
                <DetailRow label="Project ID">
                  <CopyValue display={`${project.id.slice(0, 8)}…`} label="project ID" value={project.id} />
                </DetailRow>
                <DetailRow label="Created">
                  <Timestamp value={project.createdAt} />
                </DetailRow>
                <DetailRow label="Updated">
                  <Timestamp value={project.updatedAt} />
                </DetailRow>
              </DetailList>
            </Panel>

            {envState.status !== "error" && <EnvironmentsPanel environments={environments} selected={selected} />}
          </div>
        </div>
      </PageBody>
    </>
  );
}

function EnvironmentsPanel({ environments, selected }: { environments: Environment[] | null; selected: EnvironmentType }) {
  return (
    <Panel title="Environments">
      {!environments ? (
        <div aria-busy="true" aria-label="Loading environments" className="grid gap-2 p-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <ul className="divide-y">
          {environments.map((env) => {
            const envMeta = environmentTypeMeta[env.type];
            const isCurrent = env.type === selected;
            return (
              <li aria-current={isCurrent ? "true" : undefined} className="flex items-start gap-3 px-4 py-3 text-sm" key={env.id}>
                <EnvironmentDot className="mt-2" type={env.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    {envMeta.label}
                    {isCurrent && <Badge variant="secondary">Viewing</Badge>}
                  </div>
                  <p className="text-muted-foreground">{envMeta.description}</p>
                </div>
                <CopyValue display={`${env.id.slice(0, 8)}…`} label={`${envMeta.label} environment ID`} value={env.id} />
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
