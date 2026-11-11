"use client";

import { LayoutDashboard, ListTodo, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ComponentProps, Suspense } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { NavUser } from "@/components/dashboard/nav-user";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "@/components/ui/sidebar";

// Sections that don't have pages yet are listed but disabled, so the layout
// reads like the finished product without linking to 404s.
const upcoming = [
  { title: "Tasks", icon: ListTodo },
  { title: "Members", icon: Users },
  { title: "Settings", icon: Settings },
];

function ProjectNav() {
  const { slug } = useParams<{ slug?: string }>();
  const { state } = useDashboard();

  if (state.status !== "ready") {
    return (
      <SidebarMenu>
        {Array.from({ length: 4 }, (_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  const project = state.projects.find((p) => p.slug === slug);
  if (!project) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive render={<Link href={`/dashboard/${project.slug}`} />} tooltip="Overview">
          <LayoutDashboard />
          <span>Overview</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {upcoming.map(({ title, icon: Icon }) => (
        <SidebarMenuItem key={title}>
          <SidebarMenuButton aria-disabled className="text-sidebar-foreground/60" tooltip={`${title} (coming soon)`}>
            <Icon />
            <span>{title}</span>
          </SidebarMenuButton>
          <SidebarMenuBadge className="text-[10px] font-normal text-muted-foreground">Soon</SidebarMenuBadge>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* useParams is request-time data under Cache Components */}
        <Suspense fallback={<SidebarMenuSkeleton className="h-12" showIcon />}>
          <ProjectSwitcher />
        </Suspense>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <Suspense fallback={null}>
            <ProjectNav />
          </Suspense>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
