"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function Crumbs() {
  const { slug } = useParams<{ slug?: string }>();
  const { state } = useDashboard();
  const project = state.status === "ready" ? state.projects.find((p) => p.slug === slug) : undefined;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          {project ? (
            <BreadcrumbLink render={<Link href="/dashboard" />}>Projects</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Projects</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {project && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-48 truncate">{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function SiteHeader() {
  const { setCreateDialogOpen } = useDashboard();

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 data-vertical:h-4 data-vertical:self-center" orientation="vertical" />
      <Suspense fallback={null}>
        <Crumbs />
      </Suspense>
      <Button className="ml-auto" onClick={() => setCreateDialogOpen(true)} size="sm" variant="outline">
        <Plus />
        New project
      </Button>
    </header>
  );
}
