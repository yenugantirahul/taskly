"use client";

import { ChevronsUpDown, LoaderCircle, LogOut, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";

function initials(nameOrEmail: string) {
  const parts = nameOrEmail.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

function Identity({ name, email }: { name: string; email: string }) {
  return (
    <>
      <Avatar className="size-7 rounded-md">
        <AvatarFallback className="rounded-md text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </span>
    </>
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { state, signOut } = useDashboard();
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  if (state.status !== "ready") return <SidebarMenuSkeleton className="h-12" showIcon />;

  const { user } = state;
  const name = user.name || user.email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton className="h-10 gap-2 rounded-md px-2 hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent" />}>
            <Identity email={user.email} name={name} />
            <ChevronsUpDown className="ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56" side={isMobile ? "bottom" : "right"} sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 px-1 py-1.5 font-normal text-foreground">
                <Identity email={user.email} name={name} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoon />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup onValueChange={(value) => setTheme(value as string)} value={theme ?? "system"}>
                  <DropdownMenuRadioItem value="light">
                    <Sun />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            {/* Stays open while the session is revoked, so the click has visible feedback */}
            <DropdownMenuItem
              closeOnClick={false}
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut();
              }}
            >
              {signingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}
              {signingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
