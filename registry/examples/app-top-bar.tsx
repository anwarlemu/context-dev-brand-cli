"use client";

import { useState } from "react";
import { AppTopBar } from "@/components/product/app-top-bar";
import { AppSidebar, SidebarGroup, SidebarLink } from "@/components/product/app-sidebar";
import { Product as CreditsExample } from "./credits-menu";

export function Product() {
  const [open, setOpen] = useState(false);
  return <div className="w-full self-start"><AppTopBar onMenuClick={() => setOpen(true)}><CreditsExample /></AppTopBar>
    <div className="md:hidden"><AppSidebar open={open} onOpenChange={setOpen} navLabel="Example navigation"><SidebarGroup><SidebarLink href="/preview/overview-page/Block">Overview</SidebarLink><SidebarLink href="/preview/table-page/Block">API keys</SidebarLink></SidebarGroup></AppSidebar></div>
  </div>;
}
