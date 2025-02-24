import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarRight } from "@/components/sidebar-right"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import type React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-auto">{children}</SidebarInset>
        <SidebarRight />
      </div>
    </SidebarProvider>
  )
}

