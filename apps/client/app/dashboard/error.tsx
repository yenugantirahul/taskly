"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageBar } from "@/components/dashboard/page-header";
import { Button, buttonVariants } from "@/components/ui/button";

// Catches render errors inside the dashboard; the sidebar stays usable, and
// the bar keeps the phone sidebar button.
export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageBar title="Something went wrong" />
      <EmptyState
        action={
          <>
            <Button onClick={() => retry()}>Try again</Button>
            <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">
              Back to projects
            </Link>
          </>
        }
        description="This page hit an unexpected error. Try again; if it keeps happening, reload the page."
        icon={CircleAlert}
        title="This page didn't load"
      />
    </>
  );
}
