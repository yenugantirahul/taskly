"use client";

import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageBar } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

export function DashboardContent({ children }: { children: ReactNode }) {
  const { state, retry } = useDashboard();

  if (state.status === "error") {
    return (
      <>
        <PageBar title="Couldn't load" />
        <EmptyState
          action={
            <Button onClick={retry} variant="outline">
              Try again
            </Button>
          }
          description={state.message}
          icon={CircleAlert}
          title="Couldn't load your workspace"
        />
      </>
    );
  }

  return <div className="flex flex-1 flex-col">{children}</div>;
}
