"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { projectTypeMeta } from "@/lib/types";

export function ProjectSwitcher() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { slug } = useParams<{ slug?: string }>();
  const { state, setCreateDialogOpen } = useDashboard();

  if (state.status !== "ready") {
    return <SidebarMenuSkeleton className="h-12" showIcon />;
  }

  const { projects } = state;
  const current = projects.find((project) => project.slug === slug);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton className="data-popup-open:bg-sidebar-accent" size="lg" />}>
            {current ? (
              <ProjectTypeIcon className="size-8 rounded-lg [&_svg]:size-4" type={current.type} />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-dashed">
                <Plus className="size-4" />
              </span>
            )}
            <span className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {current?.name ?? (projects.length ? "Select a project" : "No projects")}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {current ? projectTypeMeta[current.type].label : "Projects"}
              </span>
            </span>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-60" side={isMobile ? "bottom" : "right"} sideOffset={4}>
            {projects.length > 0 && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
                  {projects.map((project) => (
                    <DropdownMenuItem
                      className="gap-2 p-2"
                      key={project.id}
                      onClick={() => {
                        setOpenMobile(false);
                        router.push(`/dashboard/${project.slug}`);
                      }}
                    >
                      <ProjectTypeIcon type={project.type} />
                      <span className="min-w-0 flex-1 truncate">{project.name}</span>
                      {project.slug === slug && <span aria-label="Current project" className="size-1.5 rounded-full bg-brand" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => {
                setOpenMobile(false);
                setCreateDialogOpen(true);
              }}
            >
              <span className="grid size-6 place-items-center rounded-md border bg-background">
                <Plus className="size-3.5" />
              </span>
              <span className="font-medium text-muted-foreground">New project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
