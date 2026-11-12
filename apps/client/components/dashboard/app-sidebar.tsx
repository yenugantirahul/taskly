"use client";

import { FolderKanban, LayoutDashboard, ListTodo, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { type ComponentProps, Suspense } from "react";

import { LogoBadge } from "@/components/brand/logo";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EnvironmentSelector } from "@/components/dashboard/environment-selector";
import { NavUser } from "@/components/dashboard/nav-user";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { SidebarNavLink, SidebarNavSection, SidebarNavSoon } from "@/components/dashboard/sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Layout, top to bottom:
//   brand row (same 48px as the page header) with the collapse toggle
//   context block: Project label, project picker, environment picker
//   navigation: workspace links, then the current project's sections
//   account menu
function BrandRow() {
  return (
    <SidebarHeader className="h-12 flex-row items-center gap-2 border-b border-sidebar-border px-3 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Link
        aria-label="MiniTrigger, all projects"
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
        href="/dashboard"
      >
        <LogoBadge className="size-6 rounded-md [&_svg]:size-3.5" />
        <span className="truncate text-sm font-semibold tracking-tight">MiniTrigger</span>
      </Link>
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
    </SidebarHeader>
  );
}

function useCurrentSlug() {
  const { slug } = useParams<{ slug?: string }>();
  const { state } = useDashboard();
  if (!slug || state.status !== "ready") return { slug, project: undefined };
  return { slug, project: state.projects.find((p) => p.slug === slug) };
}

function ContextBlock() {
  const { project } = useCurrentSlug();
  return (
    <div className="grid gap-1 border-b border-sidebar-border p-2">
      <span className="px-2 pt-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Project</span>
      <ProjectSwitcher />
      {project && (
        // useSearchParams (inside) is request-time data under Cache Components
        <Suspense fallback={<SidebarMenuSkeleton />}>
          <EnvironmentSelector projectSlug={project.slug} />
        </Suspense>
      )}
    </div>
  );
}

function Navigation() {
  const pathname = usePathname();
  const { slug, project } = useCurrentSlug();
  const { state } = useDashboard();
  const base = project ? `/dashboard/${project.slug}` : "";

  return (
    <>
      <SidebarNavSection>
        <SidebarNavLink active={pathname === "/dashboard"} href="/dashboard" icon={FolderKanban} label="All projects" />
      </SidebarNavSection>

      {slug && state.status !== "ready" && (
        <SidebarNavSection title="Project">
          {Array.from({ length: 3 }, (_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ))}
        </SidebarNavSection>
      )}

      {project && (
        <>
          <SidebarNavSection title="Project">
            <SidebarNavLink active={pathname === base} href={base} icon={LayoutDashboard} label="Overview" />
            <SidebarNavSoon icon={ListTodo} label="Tasks" />
            <SidebarNavSoon icon={Users} label="Members" />
          </SidebarNavSection>
          <SidebarNavSection title="Configure">
            <SidebarNavLink active={pathname === `${base}/settings`} href={`${base}/settings`} icon={Settings} label="Settings" />
          </SidebarNavSection>
        </>
      )}
    </>
  );
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <BrandRow />
      {/* useParams / usePathname are request-time data under Cache Components */}
      <Suspense fallback={<div className="h-12 border-b border-sidebar-border" />}>
        <ContextBlock />
      </Suspense>
      <SidebarContent className="gap-0 py-2">
        <Suspense
          fallback={
            <SidebarMenu className="p-2">
              <SidebarMenuSkeleton showIcon />
            </SidebarMenu>
          }
        >
          <Navigation />
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
