"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Sidebar rows follow two rules shared by the reference dashboards:
// - two neutral tones only: muted when idle, foreground on hover or when current;
// - one fill per row, the same for hover and current, so the two never stack.
// The accent color stays out of navigation; it's for actions and the current-project dot.
const rowClass =
  "h-8 gap-2 rounded-md px-2 font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground data-active:bg-sidebar-accent data-active:text-foreground [&_svg]:size-4";

export function SidebarNavLink({ href, active, icon: Icon, label }: { href: string; active: boolean; icon: LucideIcon; label: string }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={rowClass}
        isActive={active}
        onClick={() => setOpenMobile(false)}
        render={<Link aria-current={active ? "page" : undefined} href={href} />}
        tooltip={label}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// A section that exists in the product but isn't built yet: visibly inert, never a dead link.
export function SidebarNavSoon({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton aria-disabled className={cn(rowClass, "text-muted-foreground/60")} tooltip={`${label} (coming soon)`}>
        <Icon />
        <span className="flex-1">{label}</span>
        <span className="rounded-sm border px-1 text-xs font-normal text-muted-foreground group-data-[collapsible=icon]:hidden">
          Soon
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Collapsible titled group. When the sidebar is collapsed to icons the title
// becomes a hairline divider, so groups stay visually separate.
export function SidebarNavSection({ title, children }: { title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = title ? `nav-${title.toLowerCase().replace(/\W+/g, "-")}` : undefined;

  return (
    <SidebarGroup className="px-2 py-1">
      {title && (
        <>
          <button
            aria-controls={id}
            aria-expanded={open}
            className="group/section flex h-6 w-full items-center gap-1 rounded-sm px-2 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {title}
            <ChevronDown aria-hidden className={cn("size-3 transition-transform duration-150", !open && "-rotate-90")} />
          </button>
          <div aria-hidden className="mx-2 my-2 hidden h-px bg-sidebar-border group-data-[collapsible=icon]:block" />
        </>
      )}
      {/* Always open in icon mode: the titles that toggle it are hidden there. */}
      <div className={cn(!open && "hidden group-data-[collapsible=icon]:block")} id={id}>
        <SidebarMenu className="gap-px">{children}</SidebarMenu>
      </div>
    </SidebarGroup>
  );
}
