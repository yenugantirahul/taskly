"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { EnvironmentDot } from "@/components/dashboard/environment-switcher";
import { DEFAULT_ENVIRONMENT, useSelectedEnvironment } from "@/components/dashboard/use-environment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { ENVIRONMENT_TYPES, type EnvironmentType, environmentTypeMeta } from "@/lib/types";

// Sidebar environment picker, under the project picker. The selection lives
// in the URL (?env=), so picking one from a non-overview page opens the
// project overview in that environment.
export function EnvironmentSelector({ projectSlug }: { projectSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { selected, select } = useSelectedEnvironment();
  const overview = `/dashboard/${projectSlug}`;

  function choose(type: EnvironmentType) {
    setOpenMobile(false);
    if (pathname === overview) return select(type);
    router.push(type === DEFAULT_ENVIRONMENT ? overview : `${overview}?env=${type}`);
  }

  const meta = environmentTypeMeta[selected];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                aria-label={`Environment: ${meta.label}. Change environment`}
                className="h-8 gap-2 rounded-md px-2 font-medium hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
                tooltip={`Environment: ${meta.label}`}
              />
            }
          >
            <span className="grid size-4 shrink-0 place-items-center">
              <EnvironmentDot type={selected} />
            </span>
            <span className="flex-1 truncate">{meta.label}</span>
            <ChevronsUpDown className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-60" side={isMobile ? "bottom" : "right"} sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Environments</DropdownMenuLabel>
              {ENVIRONMENT_TYPES.map((type) => (
                <DropdownMenuItem className="items-start gap-2 p-2" key={type} onClick={() => choose(type)}>
                  <span className="grid size-4 shrink-0 place-items-center pt-1">
                    <EnvironmentDot type={type} />
                  </span>
                  <span className="grid flex-1">
                    <span className="font-medium">{environmentTypeMeta[type].label}</span>
                    <span className="text-xs text-muted-foreground">{environmentTypeMeta[type].description}</span>
                  </span>
                  {type === selected && <Check aria-label="Current environment" className="mt-0.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
