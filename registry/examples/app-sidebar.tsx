"use client";

import { useState } from "react";
import { Boxes, ChartNoAxesColumn, CircleHelp, Code, KeyRound, LayoutGrid, Radar, Users } from "lucide-react";
import { AppSidebar, SidebarButton, SidebarGroup, SidebarLink, SidebarSearchButton } from "@/components/product/app-sidebar";
import { UserMenu } from "@/components/product/user-menu";
import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";
import { Button } from "@/components/ui/button";

const GROUPS = [{ label: undefined, items: [{ title: "Overview", icon: LayoutGrid }] }, { label: "Products", items: [{ title: "Data APIs", icon: Boxes }, { title: "Monitors", icon: Radar }] }, { label: "Workspace", items: [{ title: "API keys", icon: KeyRound }, { title: "Usage", icon: ChartNoAxesColumn }, { title: "Team", icon: Users }] }];
export function Product() {
  const [workspace, setWorkspace] = useState("acme");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Overview");
  return <div className="flex h-[34rem] w-full overflow-hidden">
    <AppSidebar open={open} onOpenChange={setOpen} header={<><div className="min-w-0"><WorkspaceSwitcher value={workspace} onValueChange={setWorkspace} workspaces={[{ id: "acme", name: "Acme", plan: "Pro" }, { id: "personal", name: "Personal", plan: "Free" }]} /></div><SidebarSearchButton onClick={() => { window.location.href = "/preview/command/Product"; }} /></>} footer={<><SidebarButton icon={CircleHelp} onClick={() => setActive("Help: hello@context.dev")}>Help</SidebarButton><SidebarLink href="https://docs.context.dev" target="_blank" rel="noreferrer" icon={Code}>Documentation</SidebarLink><UserMenu name="Ian Gerado" email="ian@acme.com" /></>}>
      {GROUPS.map((group) => <SidebarGroup key={group.label ?? "main"} label={group.label}>{group.items.map(({ title, icon }) => <SidebarLink key={title} href="#example-page" icon={icon} active={active === title} onClick={(event) => { event.preventDefault(); setActive(title); setOpen(false); }}>{title}</SidebarLink>)}</SidebarGroup>)}
    </AppSidebar>
    <div id="example-page" className="flex min-w-0 flex-1 flex-col gap-4 p-4"><Button className="self-start md:hidden" variant="outline" onClick={() => setOpen(true)}>Open navigation</Button><p role="status" className="text-body-sm">{active}</p></div>
  </div>;
}
