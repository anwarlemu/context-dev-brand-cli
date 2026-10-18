"use client";

import * as React from "react";
import { Boxes, ChartNoAxesColumn, ChevronRight, CircleHelp, Code, Gauge, Image, KeyRound, Layers, LayoutGrid, type LucideIcon, Radar, Users } from "lucide-react";

import { AppSidebar, SidebarButton, SidebarGroup, SidebarLink, SidebarSearchButton } from "@/components/product/app-sidebar";
import { AppTopBar } from "@/components/product/app-top-bar";
import { CreditsMenu } from "@/components/product/credits-menu";
import { SidebarAlertCard } from "@/components/product/sidebar-alert-card";
import { UserMenu } from "@/components/product/user-menu";
import { WorkspaceSwitcher } from "@/components/product/workspace-switcher";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { navigate } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type NavItem = { title: string; icon: LucideIcon; trailing?: React.ReactNode };

// The redesigned dashboard's navigation: Overview alone at the top, then Products and Workspace. Settings and
// referrals live in the account menu. Replace the links with your routes (pass your router's link with asChild).
const NAV: { label?: string; items: NavItem[] }[] = [
  { items: [{ title: "Overview", icon: LayoutGrid }] },
  {
    label: "Products",
    items: [
      { title: "Data APIs", icon: Boxes, trailing: <ChevronRight className="size-3.5 text-fg-subtle" strokeWidth={1.75} /> },
      { title: "Monitors", icon: Radar },
      { title: "Batches", icon: Layers },
      { title: "Logo Link", icon: Image },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "API keys", icon: KeyRound },
      { title: "Usage", icon: ChartNoAxesColumn },
      { title: "Team", icon: Users },
    ],
  },
];

const ROUTES: Record<string, string> = { Overview: "/", "Data APIs": "/playground/scrape", Monitors: "/monitors", Batches: "/batches", "Logo Link": "/logo-link", "API keys": "/api-keys", Usage: "/usage", Team: "/team" };

const WORKSPACES = [
  { id: "acme", name: "Acme", plan: "Pro" },
  { id: "personal", name: "Personal", plan: "Free" },
  { id: "labs", name: "Acme Labs", plan: "Starter" },
];

// Fades the top of the page into the canvas once it's scrolled, so content slips under the top bar instead of being
// cut at a hard edge; it stops short of the scrollbar so the thumb stays crisp.
function ScrollTopShade({ scrollerRef }: { scrollerRef: React.RefObject<HTMLElement | null> }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setScrolled(el.scrollTop > 0);
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [scrollerRef]);
  return <div aria-hidden className={cn("pointer-events-none absolute top-0 right-2 left-0 z-30 h-6 bg-linear-to-b from-canvas to-transparent transition-opacity duration-200 ease-out motion-reduce:transition-none", scrolled ? "opacity-100" : "opacity-0")} />;
}

// The product's shell: the canvas edge to edge, the sidebar on it, and beside it the top bar (the menu button on
// phones, the credits at the right) over the page's own scroller. Every page reserves the scrollbar's width on both
// sides, so a centered column sits in the same place whether or not the page is long enough to scroll. It fills its
// parent: give that the viewport's height (h-dvh).
export function AppShell({ active = "Overview", paymentFailed = false, className, children }: { active?: string; paymentFailed?: boolean; className?: string; children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = React.useState(WORKSPACES);
  const [defaultWorkspace, setDefaultWorkspace] = React.useState("acme");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [organizationName, setOrganizationName] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [signedOut, setSignedOut] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const [workspace, setWorkspace] = React.useState("acme");
  const [autoTopUp, setAutoTopUp] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const isActive = (title: string) => title.toLowerCase() === active.toLowerCase();
  if (signedOut) return <div className="grid h-full place-content-center gap-4"><p role="status">Signed out of this example.</p><Button onClick={() => setSignedOut(false)}>Sign in again</Button></div>;
  return (
    <div data-slot="app-shell" className={cn("ds-product flex h-full min-h-0 overflow-clip bg-canvas text-fg", className)}>
      <AppSidebar
        open={navOpen}
        onOpenChange={setNavOpen}
        header={
          <>
            <section aria-label="Workspace" className="min-w-0">
              <WorkspaceSwitcher workspaces={workspaces} value={workspace} defaultId={defaultWorkspace} onValueChange={setWorkspace} onMakeDefault={setDefaultWorkspace} onOpenSettings={() => { navigate("/settings?tab=organization"); }} onCreate={() => setCreateOpen(true)} />
            </section>
            <SidebarSearchButton onClick={() => { setNavOpen(false); setSearchOpen(true); }} />
          </>
        }
        footer={
          <>
            {paymentFailed && <SidebarAlertCard tone="danger" tag="Last payment failed" message="Your payment method is failing." action="Fix issue" pendingAction="Opening..." onClick={() => { navigate("/settings?tab=billing"); }} />}
            <SidebarButton icon={CircleHelp} onClick={() => setHelpOpen(true)}>Help</SidebarButton>
            <SidebarLink href="https://docs.context.dev" icon={Code} target="_blank" rel="noopener noreferrer">
              Documentation
            </SidebarLink>
            <UserMenu
              name="Ian Gerado"
              email="ian@acme.com"
              sections={[
                [{ label: "Settings", href: "/settings" }, { label: "Share & get rewards", href: "/settings?tab=referrals" }, { label: "Talk to a founder", href: "https://cal.com/context-dev/30min", external: true }, { label: "Changelog", href: "https://context.dev/changelog", external: true }],
                [{ label: "Terms & conditions", href: "https://context.dev/terms", external: true }, { label: "Privacy policy", href: "https://context.dev/privacy", external: true }],
              ]}
              onLogOut={() => setSignedOut(true)}
            />
          </>
        }
      >
        {NAV.map((group) => (
          <SidebarGroup key={group.label ?? "main"} label={group.label}>
            {group.items.map((item) => (
              <SidebarLink key={item.title} href={ROUTES[item.title]} icon={item.icon} trailing={item.trailing} active={isActive(item.title)} onClick={() => setNavOpen(false)}>
                {item.title}
              </SidebarLink>
            ))}
          </SidebarGroup>
        ))}
      </AppSidebar>
      <main data-slot="sidebar-inset" className="flex min-w-0 flex-1 flex-col overflow-clip">
        <AppTopBar onMenuClick={() => setNavOpen(true)}>
          <CreditsMenu
            remaining={41590}
            total={100000}
            plan={{ name: "Pro", price: "$49/month", resetLabel: "Nov 1" }}
            refill={100000}
            rateLimit="600 req/min"
            autoTopUp={autoTopUp}
            onAutoTopUpChange={setAutoTopUp}
            autoTopUpDescription="Off. Requests stop when you run out of credits."
            onUpgrade={() => { navigate("/settings?tab=billing"); }}
            usageAction={
              <a href="/usage">
                <Gauge className="size-3.5" strokeWidth={1.5} />
                View usage
              </a>
            }
          />
        </AppTopBar>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div ref={scrollerRef} className="ds-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable_both-edges]">
            {children}
          </div>
          <ScrollTopShade scrollerRef={scrollerRef} />
        </div>
      </main>
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search the workspace" description="Find a page."><CommandInput placeholder="Search pages" /><CommandList><CommandEmpty>Nothing matches.</CommandEmpty>{Object.entries(ROUTES).map(([title, href]) => <CommandItem key={title} onSelect={() => { navigate(href); }}>{title}</CommandItem>)}</CommandList></CommandDialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><form onSubmit={(event) => { event.preventDefault(); if (!organizationName.trim()) return; const id = crypto.randomUUID(); setWorkspaces((all) => [...all, { id, name: organizationName.trim(), plan: "Free" }]); setWorkspace(id); setOrganizationName(""); setCreateOpen(false); }}><DialogHeader><DialogTitle>Create organization</DialogTitle><DialogDescription>Add a workspace to this example.</DialogDescription></DialogHeader><DialogBody><Field label="Organization name" required><Input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} /></Field></DialogBody><DialogFooter><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" variant="brand" disabled={!organizationName.trim()}>Create</Button></DialogFooter></form></DialogContent></Dialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent><DialogHeader><DialogTitle>Help</DialogTitle><DialogDescription>Contact the team or read the API documentation.</DialogDescription></DialogHeader><DialogBody className="flex flex-wrap gap-3"><Button asChild><a href="mailto:hello@context.dev">Email support</a></Button><Button asChild><a href="https://docs.context.dev" target="_blank" rel="noreferrer">Documentation</a></Button></DialogBody></DialogContent></Dialog>
    </div>
  );
}
