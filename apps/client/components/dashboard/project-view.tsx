"use client";

import { FileQuestion, ListTodo } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projectTypeMeta } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm not-last:border-b">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

const taskColumns = ["Task", "Status", "Assignee", "Updated"];

export function ProjectView({ slug }: { slug: string }) {
  const { state } = useDashboard();
  if (state.status !== "ready") return <PageSkeleton />;

  // Projects come from the caller's own list, so another user's slug is
  // simply "not found" here, matching the API's 404.
  const project = state.projects.find((p) => p.slug === slug);
  if (!project) {
    return (
      <EmptyState
        action={
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">
            Back to projects
          </Link>
        }
        description="It may have been deleted, or the link is wrong."
        icon={FileQuestion}
        title="Project not found"
      />
    );
  }

  const meta = projectTypeMeta[project.type];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <ProjectTypeIcon className="size-10 rounded-lg [&_svg]:size-5" type={project.type} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant="secondary">{meta.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_18rem]">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Tasks</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  {taskColumns.map((column) => (
                    <th className="px-4 py-2 font-medium" key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={taskColumns.length}>
                    <EmptyState
                      description="Tasks you add to this project will show up here."
                      icon={ListTodo}
                      title="No tasks yet"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Type">{meta.label}</DetailRow>
              <DetailRow label="Slug">
                <code className="font-mono text-xs">{project.slug}</code>
              </DetailRow>
              <DetailRow label="Created">{dateFormat.format(new Date(project.createdAt))}</DetailRow>
              <DetailRow label="Updated">{dateFormat.format(new Date(project.updatedAt))}</DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
