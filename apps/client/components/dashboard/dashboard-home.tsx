"use client";

import { Plus, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CopyValue, Timestamp } from "@/components/dashboard/data-display";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Onboarding } from "@/components/dashboard/onboarding";
import { PageBar, PageBody } from "@/components/dashboard/page-header";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectTypeMeta } from "@/lib/types";

// /dashboard: every project the user owns, newest first.
export function DashboardHome() {
  const router = useRouter();
  const { state, setCreateDialogOpen } = useDashboard();
  const [query, setQuery] = useState("");

  if (state.status !== "ready") return <PageSkeleton />;

  const { projects } = state;
  // First run: guided setup instead of an empty table.
  if (projects.length === 0) return <Onboarding />;
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.slug.includes(needle) ||
          projectTypeMeta[p.type].label.toLowerCase().includes(needle),
      )
    : projects;

  const newProject = (
    <Button onClick={() => setCreateDialogOpen(true)} size="sm">
      <Plus />
      New project
    </Button>
  );

  return (
    <>
      <PageBar actions={newProject} title="Projects" />
      <PageBody>
        {/* Filter row: search on the left, result count on the right */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Filter projects"
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by name, slug or type"
              type="search"
              value={query}
            />
          </div>
          <p aria-live="polite" className="font-mono text-xs text-muted-foreground">
            {visible.length === projects.length
              ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}`
              : `${visible.length} of ${projects.length} projects`}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">Your projects</caption>
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="w-full px-4 py-2 font-medium" scope="col">Name</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell" scope="col">Type</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell" scope="col">Slug</th>
                <th className="px-4 py-2 text-right font-medium" scope="col">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((project) => (
                <tr
                  className="group cursor-pointer text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-foreground"
                  key={project.id}
                  // The name link is the keyboard and screen-reader target; the row is a larger mouse target.
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("a, button")) return;
                    router.push(`/dashboard/${project.slug}`);
                  }}
                >
                  <td className="max-w-0 px-4 py-2">
                    <Link
                      className="flex min-w-0 items-center gap-2 rounded-md font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      href={`/dashboard/${project.slug}`}
                    >
                      <ProjectTypeIcon type={project.type} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-2 whitespace-nowrap md:table-cell">{projectTypeMeta[project.type].label}</td>
                  <td className="hidden px-4 py-2 sm:table-cell">
                    <CopyValue label="slug" value={project.slug} />
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Timestamp value={project.createdAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <EmptyState
              action={
                <Button onClick={() => setQuery("")} variant="outline">
                  Clear filter
                </Button>
              }
              className="py-12"
              description={`No project name, slug or type matches "${query.trim()}".`}
              icon={SearchX}
              title="No matching projects"
            />
          )}
        </div>
      </PageBody>
    </>
  );
}
