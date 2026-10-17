"use client";

import { Boxes, ChartNoAxesColumn, ChevronRight, CircleHelp, Code, KeyRound, LayoutGrid, Radar, Users } from "lucide-react";

import { AppSidebar, SidebarButton, SidebarGroup, SidebarLink, SidebarSearchButton } from "@/components/product/app-sidebar";
import { UserMenu } from "@/components/product/user-menu";
import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";

export function Product() {
  return (
    <div className="h-[34rem] overflow-hidden rounded-card border border-line">
      <AppSidebar
        header={
          <>
            <div className="min-w-0">
              <WorkspaceSwitcher value="acme" onValueChange={() => {}} workspaces={[{ id: "acme", name: "Acme", plan: "Pro" }]} />
            </div>
            <SidebarSearchButton />
          </>
        }
        footer={
          <>
            <SidebarButton icon={CircleHelp}>Help</SidebarButton>
            <SidebarLink href="#" icon={Code}>
              Documentation
            </SidebarLink>
            <UserMenu name="Ian Gerado" email="ian@acme.com" />
          </>
        }
      >
        <SidebarGroup>
          <SidebarLink href="#" icon={LayoutGrid} active>
            Overview
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup label="Products">
          <SidebarLink href="#" icon={Boxes} trailing={<ChevronRight className="size-3.5 text-fg-subtle" strokeWidth={1.75} />}>
            Data APIs
          </SidebarLink>
          <SidebarLink href="#" icon={Radar}>
            Monitors
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup label="Workspace">
          <SidebarLink href="#" icon={KeyRound}>
            API keys
          </SidebarLink>
          <SidebarLink href="#" icon={ChartNoAxesColumn}>
            Usage
          </SidebarLink>
          <SidebarLink href="#" icon={Users}>
            Team
          </SidebarLink>
        </SidebarGroup>
      </AppSidebar>
    </div>
  );
}
