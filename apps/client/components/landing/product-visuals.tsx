// Static renderings of real MiniTrigger screens for the landing page. They use
// the same tokens, icons and copy as the dashboard components, with sample
// project names in place of a signed-in user's data. Every visual stays at
// text-sm so the landing page keeps to four type sizes.

import {
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  ListTodo,
  Monitor,
  Moon,
  PanelLeft,
  Plus,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { ProjectTypeIcon } from "@/components/dashboard/project-type-icon";
import { PROJECT_TYPES, type ProjectType, projectTypeMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const sampleProjects: { name: string; type: ProjectType }[] = [
  { name: "API v2", type: "software" },
  { name: "Spring launch", type: "marketing" },
  { name: "Brand refresh", type: "design" },
  { name: "Vendor onboarding", type: "operations" },
  { name: "Half marathon", type: "personal" },
];

export function Frame({ className, children, label }: { className?: string; children: ReactNode; label: string }) {
  return (
    <div
      aria-label={label}
      className={cn("@container overflow-hidden rounded-xl border bg-card text-sm text-card-foreground shadow-card", className)}
      role="img"
    >
      {/* The visual is a picture of the UI, not working controls */}
      <div aria-hidden="true" className="h-full">
        {children}
      </div>
    </div>
  );
}

function FakeButton({ children, variant = "primary", className }: { children: ReactNode; variant?: "primary" | "outline"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2 rounded-lg px-3 font-medium whitespace-nowrap [&_svg]:size-4",
        variant === "primary" ? "bg-primary text-primary-foreground" : "border bg-background",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FakeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="font-medium">{label}</span>
      <span className="flex h-8 items-center rounded-lg border bg-background px-3 text-muted-foreground">{value}</span>
    </div>
  );
}

function DetailsList({ slug }: { slug: string }) {
  const rows: [string, ReactNode][] = [
    ["Type", "Software"],
    ["Slug", <code className="font-mono" key="slug">{slug}</code>],
    ["Created", "Nov 3, 2026"],
    ["Updated", "Nov 3, 2026"],
  ];
  return (
    <dl>
      {rows.map(([label, value]) => (
        <div className="flex items-center justify-between gap-4 py-2 not-last:border-b" key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="truncate">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* Hero: the project overview with the sidebar, as a signed-in user sees it */
export function DashboardPreview() {
  const nav = [
    { title: "Tasks", icon: ListTodo },
    { title: "Members", icon: Users },
    { title: "Settings", icon: Settings },
  ];

  return (
    <Frame label="The MiniTrigger dashboard: a sidebar with the API v2 project selected, and its overview page showing an empty tasks list and project details.">
      <div className="grid @2xl:grid-cols-[13rem_1fr]">
        <aside className="hidden flex-col gap-4 border-r bg-sidebar p-2 @2xl:flex">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <ProjectTypeIcon className="size-8 rounded-lg [&_svg]:size-4" type="software" />
            <span className="grid flex-1 leading-tight">
              <span className="font-medium">API v2</span>
              <span className="text-muted-foreground">Software</span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </div>
          <div className="grid gap-1">
            <span className="px-2 pb-1 text-muted-foreground">Project</span>
            <span className="flex h-8 items-center gap-2 rounded-lg bg-sidebar-accent px-2 font-medium [&_svg]:size-4">
              <LayoutDashboard /> Overview
            </span>
            {nav.map(({ title, icon: Icon }) => (
              <span className="flex h-8 items-center gap-2 rounded-lg px-2 text-muted-foreground [&_svg]:size-4" key={title}>
                <Icon /> {title}
                <span className="ml-auto">Soon</span>
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-lg p-2">
            <span className="grid size-8 place-items-center rounded-lg bg-muted font-medium">AM</span>
            <span className="grid leading-tight">
              <span className="font-medium">Alex Morgan</span>
              <span className="text-muted-foreground">alex@company.com</span>
            </span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex h-12 items-center gap-2 border-b px-4">
            <PanelLeft className="size-4 text-muted-foreground" />
            <span className="mx-2 h-4 w-px bg-border" />
            <span className="hidden text-muted-foreground @md:inline">Projects /</span>
            <span className="truncate">API v2</span>
            <span className="text-muted-foreground">/ Overview</span>
            <FakeButton className="ml-auto px-2 @md:px-3" variant="outline">
              <Plus />
              <span className="hidden @md:inline">New project</span>
            </FakeButton>
          </div>

          <div className="grid gap-4 p-4 @2xl:p-6">
            <div className="flex items-center gap-3">
              <ProjectTypeIcon className="size-10 rounded-lg [&_svg]:size-5" type="software" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold">API v2</span>
                  <span className="rounded-sm bg-secondary px-2">Software</span>
                </div>
                <span className="text-muted-foreground">Ship features and fix bugs</span>
              </div>
            </div>

            <div className="grid items-start gap-4 @4xl:grid-cols-[1fr_15rem]">
              <div className="overflow-hidden rounded-xl border">
                <div className="border-b px-4 py-3 font-medium">Tasks</div>
                <div className="hidden grid-cols-4 border-b bg-muted/40 px-4 py-2 text-muted-foreground @lg:grid">
                  <span>Task</span>
                  <span>Status</span>
                  <span>Assignee</span>
                  <span>Updated</span>
                </div>
                <div className="grid justify-items-center gap-1 px-4 py-10 text-center">
                  <span className="mb-2 grid size-10 place-items-center rounded-lg border bg-muted/50 text-muted-foreground">
                    <ListTodo className="size-5" />
                  </span>
                  <span className="font-medium">No tasks yet</span>
                  <span className="text-muted-foreground">Tasks you add to this project will show up here.</span>
                </div>
              </div>
              <div className="rounded-xl border px-4 py-3">
                <div className="pb-2 font-medium">Details</div>
                <DetailsList slug="api-v2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Step 1: the signup form right after submitting */
export function SignupPreview() {
  return (
    <Frame className="p-4" label="The sign-up form, with a message saying a verification link was sent to alex@company.com.">
      <div className="grid gap-4">
        <FakeField label="Email" value="alex@company.com" />
        <FakeField label="Password" value="••••••••••" />
        <FakeButton>Create account</FakeButton>
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-success">
          Almost there. We sent a verification link to <strong className="font-medium">alex@company.com</strong>. Open
          it, then log in.
        </p>
      </div>
    </Frame>
  );
}

/* Step 2: the create-project dialog with a type picked */
export function CreateProjectPreview() {
  return (
    <Frame className="p-4" label="The Create project dialog: the name API v2 entered and the Software type selected.">
      <div className="grid gap-4">
        <span className="text-base font-semibold">Create project</span>
        <FakeField label="Name" value="API v2" />
        <div className="grid gap-2">
          <span className="font-medium">Type</span>
          {PROJECT_TYPES.map((type) => (
            <span
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2",
                type === "software" && "border-primary bg-accent",
              )}
              key={type}
            >
              <ProjectTypeIcon type={type} />
              <span className="font-medium">{projectTypeMeta[type].label}</span>
              <span className="ml-auto hidden truncate text-muted-foreground @xs:inline">
                {projectTypeMeta[type].description}
              </span>
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Step 3: the project's own address and details */
export function OverviewPreview() {
  return (
    <Frame label="A project's overview at the address /dashboard/api-v2, listing its type, slug and dates.">
      <div className="flex h-12 items-center gap-2 border-b bg-muted/40 px-4">
        <span className="truncate rounded-lg border bg-background px-3 py-1 font-mono">/dashboard/api-v2</span>
      </div>
      <div className="p-4">
        <div className="pb-2 font-medium">Details</div>
        <DetailsList slug="api-v2" />
      </div>
    </Frame>
  );
}

/* Feature: the project switcher menu */
export function SwitcherPreview() {
  return (
    <Frame className="p-2" label="The project switcher menu listing five projects of different types, with API v2 marked as current.">
      <div className="grid gap-1">
        <span className="px-2 py-1 text-muted-foreground">Projects</span>
        {sampleProjects.map((project, i) => (
          <span className={cn("flex items-center gap-2 rounded-lg p-2", i === 0 && "bg-accent")} key={project.name}>
            <ProjectTypeIcon type={project.type} />
            <span className="min-w-0 flex-1 truncate">{project.name}</span>
            <span className="text-muted-foreground">{projectTypeMeta[project.type].label}</span>
            <span className={cn("size-2 rounded-full", i === 0 ? "bg-primary" : "bg-transparent")} />
          </span>
        ))}
        <span className="my-1 h-px bg-border" />
        <span className="flex items-center gap-2 p-2 font-medium text-muted-foreground">
          <span className="grid size-6 place-items-center rounded-md border bg-background">
            <Plus className="size-4" />
          </span>
          New project
        </span>
      </div>
    </Frame>
  );
}

/* Feature: the login request and the cookie it sets */
export function SessionPreview() {
  return (
    <Frame label="A login request without Keep me signed in, and the response setting an HttpOnly, Secure, SameSite=Lax session cookie with no expiry date.">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="grid size-4 place-items-center rounded-sm border border-input" />
        Keep me signed in on this device
      </div>
      <pre className="overflow-x-auto p-4 font-mono leading-6">
        <code>
          <span className="text-muted-foreground">POST /api/auth/login</span>
          {"\n"}
          {`{\n  "email": "alex@company.com",\n  "password": "…",\n  "remember": false\n}`}
          {"\n\n"}
          <span className="text-muted-foreground">HTTP/1.1 200 OK</span>
          {"\n"}
          {"Set-Cookie: session=…; Path=/;\n  HttpOnly; Secure; SameSite=Lax"}
        </code>
      </pre>
    </Frame>
  );
}

/* Feature: the theme menu */
export function ThemePreview() {
  const options = [
    { label: "Light", icon: Sun },
    { label: "Dark", icon: Moon, current: true },
    { label: "System", icon: Monitor },
  ];
  return (
    <Frame className="p-2" label="The theme menu with Light, Dark and System options; Dark is selected.">
      <div className="grid gap-1">
        <span className="px-2 py-1 text-muted-foreground">Theme</span>
        {options.map(({ label, icon: Icon, current }) => (
          <span className={cn("flex items-center gap-2 rounded-lg p-2 [&_svg]:size-4", current && "bg-accent")} key={label}>
            <Icon className="text-muted-foreground" />
            {label}
            {current && <Check className="ml-auto" />}
          </span>
        ))}
      </div>
    </Frame>
  );
}
