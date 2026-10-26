"use client";

import * as React from "react";
import { BookOpen, Boxes, ChartNoAxesColumn, CircleHelp, Code2, Globe, Image, KeyRound, Layers, LayoutGrid, MoreHorizontal, Plus, Radar, Search, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const BUILD = [
  { title: "Data APIs", icon: Boxes },
  { title: "Monitors", icon: Radar, badge: "18" },
  { title: "Batches", icon: Layers },
  { title: "Logo Link", icon: Image },
];
const MANAGE = [
  { title: "API Keys", icon: KeyRound },
  { title: "Usage", icon: ChartNoAxesColumn },
  { title: "Team", icon: Users },
];

function Workspace() {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-control px-2 text-left text-body-sm text-fg outline-none hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0">
        <span className="grid size-5 shrink-0 place-items-center rounded-sm bg-primary text-caption text-on-primary">A</span>
        <span className="truncate group-data-[collapsible=icon]/sidebar:sr-only">Acme</span>
      </button>
      <button type="button" aria-label="Search" className="grid size-8 shrink-0 place-items-center rounded-control text-fg-muted outline-none hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring group-data-[collapsible=icon]/sidebar:hidden">
        <Search className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function Rail({ collapsible = "offcanvas" as const, variant = "sidebar" as const, current = "Monitors" }: { collapsible?: "offcanvas" | "icon" | "none"; variant?: "sidebar" | "floating" | "inset"; current?: string }) {
  const [active, setActive] = React.useState(current);
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <Workspace />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={active === "Overview"} onClick={() => setActive("Overview")} tooltip="Overview">
                <LayoutGrid />
                <span>Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Build</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Add a monitor">
            <Plus strokeWidth={1.5} />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {BUILD.map(({ title, icon: Icon, badge }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton isActive={active === title} onClick={() => setActive(title)} tooltip={title}>
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                  {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  {title === "Data APIs" && (
                    <SidebarMenuSub>
                      {["Brand Retrieval", "Scrape Anything", "Crawl Website"].map((api) => (
                        <SidebarMenuSubItem key={api}>
                          <SidebarMenuSubButton href="#api" isActive={active === api} onClick={(e) => { e.preventDefault(); setActive(api); }}>
                            <span>{api}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MANAGE.map(({ title, icon: Icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton isActive={active === title} onClick={() => setActive(title)} tooltip={title}>
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                  {title === "API Keys" && (
                    <SidebarMenuAction showOnHover aria-label="API key actions">
                      <MoreHorizontal strokeWidth={1.5} />
                    </SidebarMenuAction>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help">
              <CircleHelp />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Documentation">
              <a href="#docs">
                <BookOpen />
                <span>Documentation</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function Page({ title }: { title: string }) {
  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-2 px-4">
        <SidebarTrigger />
        <h1 className="text-h5 leading-snug font-normal text-fg">{title}</h1>
      </header>
      <div className="grid gap-3 px-4 pb-6">
        <div className="h-24 rounded-card bg-surface shadow-card" />
        <div className="h-40 rounded-card bg-surface shadow-card" />
      </div>
    </SidebarInset>
  );
}

export function Site() {
  return (
    <SidebarProvider className="h-[40rem] min-h-0 overflow-hidden rounded-card border border-line">
      <Rail variant="floating" current="Overview" />
      <Page title="Overview" />
    </SidebarProvider>
  );
}

export function Product() {
  return (
    <SidebarProvider className="h-[40rem] min-h-0 overflow-hidden">
      <Rail />
      <Page title="Monitors" />
    </SidebarProvider>
  );
}

export function Icons() {
  return (
    <SidebarProvider defaultOpen={false} className="h-[40rem] min-h-0 overflow-hidden">
      <Rail collapsible="icon" />
      <Page title="Monitors" />
    </SidebarProvider>
  );
}

export function Inset() {
  return (
    <SidebarProvider className="h-[40rem] min-h-0 overflow-hidden">
      <Rail variant="inset" current="Usage" />
      <Page title="Usage" />
    </SidebarProvider>
  );
}

export function Loading() {
  return (
    <SidebarProvider className="h-80 min-h-0 overflow-hidden">
      <Sidebar collapsible="none">
        <SidebarHeader>
          <SidebarMenuSkeleton />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {[Globe, Code2, Radar, Layers, KeyRound].map((Icon, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
