import type { Metadata } from "next";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Dashboard | MiniTrigger",
};

// The session is checked by the API on every request the dashboard makes;
// proxy.ts only keeps signed-out visitors from seeing the shell.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <DashboardProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <DashboardContent>{children}</DashboardContent>
        </SidebarInset>
        <CreateProjectDialog />
      </SidebarProvider>
    </DashboardProvider>
  );
}
