"use client";

import { PageBody } from "@/components/dashboard/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors PageBar + PageBody + a two-column body, so content lands without a jump.
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-1 flex-col" role="status">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Skeleton className="h-4 w-40" />
      </div>
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      </PageBody>
    </div>
  );
}
