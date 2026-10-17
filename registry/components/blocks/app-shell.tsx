"use client";

import * as React from "react";
import { BarChart3, Boxes, CircleHelp, Code, KeyRound, Layers, LayoutGrid, Radar, Search, Users } from "lucide-react";

import { AppSidebar, SidebarGroup, SidebarLink } from "@/components/product/app-sidebar";
import { AppTopBar } from "@/components/product/app-top-bar";
import { UserMenu } from "@/components/product/user-menu";
import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";
import { Button } from "@/components/ui/button";
import { DotGlyph } from "@/components/ui/dot-glyph";

const GEM = ["2.2.2", ".222.", "22222", ".222.", "2.2.2"];
import { cn } from "@/lib/utils";

// The product's shell: the canvas edge to edge, the sidebar on it, the page column beside it under a top bar that only
// holds the credits control. Replace the links with your routes (pass your router's link with SidebarLink asChild).
export function AppShell({ active = "Overview", className, children }: { active?: string; className?: string; children: React.ReactNode }) {
  const [navOpen, setNavOpen] = React.useState(false);
  const [workspace, setWorkspace] = React.useState("acme");
  const link = (title: string, icon: typeof LayoutGrid) => (
    <SidebarLink key={title} href="#" icon={icon} active={title === active} onClick={(e) => e.preventDefault()}>
      {title}
    </SidebarLink>
  );
  return (
    <div data-slot="app-shell" className={cn("ds-product flex h-full min-h-0 bg-canvas text-fg", className)}>
      <AppSidebar
        open={navOpen}
        onOpenChange={setNavOpen}
        header={
          <>
            <div className="min-w-0">
              <WorkspaceSwitcher
                value={workspace}
                onValueChange={setWorkspace}
                workspaces={[
                  { id: "acme", name: "Acme", plan: "Pro" },
                  { id: "personal", name: "Personal", plan: "Free" },
                ]}
              />
            </div>
            <Button variant="ghost" size="icon" aria-label="Search" className="mr-0.5 ml-auto">
              <Search strokeWidth={1.5} />
            </Button>
          </>
        }
        footer={
          <>
            {link("Help", CircleHelp)}
            {link("Documentation", Code)}
            <UserMenu name="Ian Gerado" email="ian@acme.com" sections={[[{ label: "Settings" }, { label: "Changelog" }], [{ label: "Log out" }]]} />
          </>
        }
      >
        <SidebarGroup>{link("Overview", LayoutGrid)}</SidebarGroup>
        <SidebarGroup label="Products">
          {link("Data APIs", Boxes)}
          {link("Monitors", Radar)}
          {link("Batches", Layers)}
        </SidebarGroup>
        <SidebarGroup label="Workspace">
          {link("API keys", KeyRound)}
          {link("Usage", BarChart3)}
          {link("Team", Users)}
        </SidebarGroup>
      </AppSidebar>
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AppTopBar onMenuClick={() => setNavOpen(true)}>
          <button type="button" className="flex h-8 items-center gap-1.5 rounded-control px-2 text-body-sm text-fg transition-colors duration-150 hover:bg-wash-hover">
            <DotGlyph rows={GEM} className="size-3.5 text-brand" />
            6,420 credits
          </button>
        </AppTopBar>
        {children}
      </div>
    </div>
  );
}
