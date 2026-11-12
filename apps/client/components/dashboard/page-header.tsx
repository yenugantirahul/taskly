"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href: string };

// The page's title row, the same 48px as the sidebar's brand row so the two
// read as one line. Parent pages are muted links before the title; actions sit
// on the right. On phones it also holds the button that opens the sidebar.
export function PageBar({
  title,
  crumbs = [],
  icon,
  badge,
  actions,
}: {
  title: ReactNode;
  crumbs?: Crumb[];
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <Link
              className="hidden shrink-0 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:inline"
              href={crumb.href}
            >
              {crumb.label}
            </Link>
            <span aria-hidden className="hidden text-muted-foreground/60 sm:inline">
              /
            </span>
          </Fragment>
        ))}
        {icon}
        <h1 aria-current="page" className="min-w-0 truncate font-semibold">
          {title}
        </h1>
        {badge}
      </nav>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

// Everything under the bar: full width, one gutter, one rhythm.
export function PageBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-1 flex-col gap-4 p-4 md:p-6", className)}>{children}</div>;
}

// A titled panel. Body padding is left to the caller so tables can run edge to edge.
export function Panel({
  title,
  description,
  actions,
  footer,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border bg-card text-card-foreground", className)}>
      <header className="flex min-h-10 items-center justify-between gap-4 border-b px-4 py-2">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
      {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t bg-muted/40 px-4 py-2">{footer}</footer>}
    </section>
  );
}
