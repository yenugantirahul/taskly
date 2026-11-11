"use client";

import { FolderPlus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { Button } from "@/components/ui/button";

export function DashboardHome() {
  const router = useRouter();
  const { state, setCreateDialogOpen } = useDashboard();
  const firstProject = state.status === "ready" ? state.projects[0] : undefined;

  // With projects, the dashboard opens the most recent one.
  useEffect(() => {
    if (firstProject) router.replace(`/dashboard/${firstProject.slug}`);
  }, [firstProject, router]);

  if (state.status !== "ready" || firstProject) return <PageSkeleton />;

  return (
    <EmptyState
      action={
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus />
          Create project
        </Button>
      }
      description="Projects keep related tasks together. Create your first one to get started."
      icon={FolderPlus}
      title="No projects yet"
    />
  );
}
