"use client";

import { BarChart3, KeyRound, LayoutGrid, Radar } from "lucide-react";

import { AppSidebar, SidebarGroup, SidebarLink } from "@/components/product/app-sidebar";

export function Product() {
  return (
    <div className="h-96 overflow-hidden rounded-card border border-line">
      <AppSidebar>
        <SidebarGroup>
          <SidebarLink href="#" icon={LayoutGrid} active>
            Overview
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup label="Products">
          <SidebarLink href="#" icon={Radar}>
            Monitors
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup label="Workspace">
          <SidebarLink href="#" icon={KeyRound}>
            API keys
          </SidebarLink>
          <SidebarLink href="#" icon={BarChart3}>
            Usage
          </SidebarLink>
        </SidebarGroup>
      </AppSidebar>
    </div>
  );
}
