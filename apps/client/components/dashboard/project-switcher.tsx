"use client";

import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react";
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

// Compact project picker for the sidebar's context block: one 32px row, the
// same height as the environment row beneath it.
export function ProjectSwitcher() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { slug } = useParams<{ slug?: string }>();
  const { state, setCreateDialogOpen } = useDashboard();

  if (state.status !== "ready") return <SidebarMenuSkeleton showIcon />;

  const { projects } = state;
  const current = projects.find((project) => project.slug === slug);
  const go = (href: string) => {
    setOpenMobile(false);
    router.push(href);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                aria-label={current ? `Project: ${current.name}. Switch project` : "Choose a project"}
                className="h-8 gap-2 rounded-md px-2 font-medium hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
                tooltip={current ? current.name : "Choose a project"}
              />
            }
          >
            {current ? (
              <ProjectTypeIcon className="size-5 rounded-sm [&_svg]:size-3" type={current.type} />
            ) : (
              <span className="grid size-5 shrink-0 place-items-center rounded-sm border border-dashed text-muted-foreground">
                <Plus className="size-3!" />
              </span>
            )}
            <span className={current ? "flex-1 truncate" : "flex-1 truncate text-muted-foreground"}>
              {current?.name ?? (projects.length ? "Choose a project" : "No projects yet")}
            </span>
            <ChevronsUpDown className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-64" side={isMobile ? "bottom" : "right"} sideOffset={4}>
            {projects.length > 0 && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
                  {projects.map((project) => (
                    <DropdownMenuItem className="gap-2 p-2" key={project.id} onClick={() => go(`/dashboard/${project.slug}`)}>
                      <ProjectTypeIcon type={project.type} />
                      <span className="min-w-0 flex-1 truncate">{project.name}</span>
                      {project.slug === slug && <Check aria-label="Current project" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem className="gap-2 p-2" onClick={() => go("/dashboard")}>
              <FolderKanban className="text-muted-foreground" />
              All projects
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => {
                setOpenMobile(false);
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="text-muted-foreground" />
              New project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
