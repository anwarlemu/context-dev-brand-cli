"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavMenuItem = { title: React.ReactNode; description?: React.ReactNode; href: string; icon?: React.ReactNode };
type NavLink = { label: string; href: string; external?: boolean };
type NavMenu = {
  label: string;
  items: NavMenuItem[];
  /** How many columns the panel lays its items in. */
  columns?: 1 | 2 | 3;
  /** A card beside the items (the site's featured product). */
  featured?: React.ReactNode;
  /** A strip along the panel's foot (the site's "Build with" links). */
  footer?: React.ReactNode;
};
type NavItem = NavLink | NavMenu;
type HeaderAction = { label: React.ReactNode; href: string };

const isMenu = (item: NavItem): item is NavMenu => "items" in item;

// A short grace before a menu closes, so the pointer can cross the gap from the trigger to the panel.
const CLOSE_DELAY_MS = 150;

const NAV_LINK =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-pill px-3.5 py-2 text-body-sm font-medium text-fg-nav outline-none transition-colors duration-150 ease-out hover:bg-subtle hover:text-fg-brand focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-fg aria-expanded:text-fg motion-reduce:transition-none";

const PANEL_COLUMNS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const;

// The announcement strip above the header: one line, a cool gray band with a hairline under it. Hover lays a neutral
// wash over the band rather than swapping its color.
function HeaderAnnouncement({ text, href }: { text: React.ReactNode; href?: string }) {
  const Comp = href ? "a" : "div";
  return (
    <Comp
      href={href}
      data-slot="site-header-announcement"
      className="group/announcement relative isolate flex min-h-11 w-full items-center justify-center overflow-hidden border-b border-hairline bg-announcement px-4 py-1 text-center text-caption text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:text-body-sm"
    >
      {href && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-wash-hover opacity-0 transition-opacity duration-150 ease-out group-hover/announcement:opacity-100 motion-reduce:transition-none" />
      )}
      <span className="min-w-0">{text}</span>
    </Comp>
  );
}

function MenuItemLink({ item }: { item: NavMenuItem }) {
  return (
    <a href={item.href} className="flex w-72 items-start gap-3 rounded-card p-3 outline-none transition-colors duration-150 ease-out hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
      {item.icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-brand text-on-brand [&>svg]:size-4">{item.icon}</span>}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-body font-medium text-fg">{item.title}</span>
        {item.description && <span className="text-body-sm text-fg-muted">{item.description}</span>}
      </span>
    </a>
  );
}

function MenuPanel({ menu }: { menu: NavMenu }) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 p-3">
        {menu.featured && <div className="flex w-68 shrink-0">{menu.featured}</div>}
        <div className={cn("grid gap-0.5", PANEL_COLUMNS[menu.columns ?? 1])}>
          {menu.items.map((item) => (
            <MenuItemLink key={item.href} item={item} />
          ))}
        </div>
      </div>
      {menu.footer && <div className="flex items-center gap-4 border-t border-hairline bg-subtle px-5 py-3 text-body-sm">{menu.footer}</div>}
    </div>
  );
}

function DesktopNav({ items, currentPath }: { items: NavItem[]; currentPath?: string }) {
  const rootRef = React.useRef<HTMLElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  // The last menu shown stays rendered while the panel fades out, so it never empties mid-exit.
  const [shown, setShown] = React.useState<string | null>(null);
  const id = React.useId();

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const openMenu = React.useCallback(
    (label: string | null) => {
      cancelClose();
      setOpen(label);
      if (label) setShown(label);
    },
    [cancelClose],
  );
  const scheduleClose = React.useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  React.useEffect(() => cancelClose, [cancelClose]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      document.getElementById(`${id}-trigger-${open}`)?.focus({ preventScroll: true });
      setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, id]);

  const menu = items.find((item): item is NavMenu => isMenu(item) && item.label === shown);

  return (
    <nav
      ref={rootRef}
      aria-label="Primary"
      className="relative hidden items-center justify-self-center lg:flex"
      onPointerLeave={(event) => event.pointerType === "mouse" && scheduleClose()}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(null)}
      onClick={(event) => event.target instanceof Element && event.target.closest("a[href]") && setOpen(null)}
    >
      <div className="flex items-center gap-1">
        {items.map((item) =>
          isMenu(item) ? (
            <button
              key={item.label}
              id={`${id}-trigger-${item.label}`}
              type="button"
              className={NAV_LINK}
              aria-expanded={open === item.label}
              aria-controls={`${id}-panel`}
              onPointerEnter={(event) => event.pointerType === "mouse" && openMenu(item.label)}
              onClick={() => openMenu(open === item.label ? null : item.label)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown") return;
                event.preventDefault();
                openMenu(item.label);
                requestAnimationFrame(() => document.getElementById(`${id}-panel`)?.querySelector("a")?.focus());
              }}
            >
              {item.label}
              <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-200 ease-out motion-reduce:transition-none", open === item.label && "rotate-180")} />
            </button>
          ) : (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              aria-current={currentPath === item.href ? "page" : undefined}
              className={NAV_LINK}
              onPointerEnter={() => openMenu(null)}
              onFocus={() => openMenu(null)}
            >
              {item.label}
            </a>
          ),
        )}
      </div>

      {/* Bridges the gap under the triggers, so the pointer reaches the panel without closing it. */}
      <div aria-hidden="true" className={cn("absolute inset-x-0 top-full h-5", !open && "pointer-events-none")} />

      {/* The panel sits in the same soft blue ring as the scrolled header. It fades and settles from just above, from its
          top edge, so it reads as hanging from the nav. */}
      <div
        id={`${id}-panel`}
        role="region"
        aria-label={shown ?? undefined}
        aria-hidden={!open}
        inert={!open || undefined}
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => event.pointerType === "mouse" && scheduleClose()}
        className={cn(
          "absolute top-[calc(100%+var(--ds-space-5))] left-1/2 z-10 w-max origin-top -translate-x-1/2 rounded-[calc(var(--ds-radius-card)+var(--ds-space-1-5))] bg-ring-tint p-1.5 shadow-floating transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none",
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-97 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-card bg-surface">{menu && <MenuPanel menu={menu} />}</div>
      </div>
    </nav>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
      <path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MobileNav({ items, primaryAction, secondaryAction, currentPath }: { items: NavItem[]; primaryAction?: HeaderAction; secondaryAction?: HeaderAction; currentPath?: string }) {
  const [open, setOpen] = React.useState(false);
  const ROW = "flex items-center border-b border-line-subtle py-5 text-body-lg text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label="Open menu" className="justify-self-end text-fg lg:hidden">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-5 pt-14 pb-5">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <nav aria-label="Mobile" className="flex flex-1 flex-col" onClick={(event) => event.target instanceof Element && event.target.closest("a[href]") && setOpen(false)}>
          <Accordion type="single" collapsible>
            {items.map((item) =>
              isMenu(item) ? (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger>{item.label}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-1">
                    {item.items.map((sub) => (
                      <a key={sub.href} href={sub.href} className="rounded-control py-1.5 text-body text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
                        {sub.title}
                      </a>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <a key={item.label} href={item.href} aria-current={currentPath === item.href ? "page" : undefined} className={ROW}>
                  {item.label}
                </a>
              ),
            )}
          </Accordion>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            {secondaryAction && (
              <Button asChild variant="pill-outline">
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              </Button>
            )}
            {primaryAction && (
              <Button asChild variant="pill">
                <a href={primaryAction.href}>{primaryAction.label}</a>
              </Button>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

/**
 * The site's header. At the top of the page it runs edge to edge in white at 85 percent over a blur; once the page
 * scrolls it gathers into a floating white pill 8px from the top, in a 6px soft blue ring (drawn as its border, with
 * the white clipped to the padding box) and the floating shadow. The links and buttons keep the pill's inner width in
 * both states, so nothing slides sideways while the bar changes around them.
 */
function SiteHeader({
  logo,
  logoHref = "/",
  logoLabel = "Home",
  announcement,
  items = [],
  primaryAction,
  secondaryAction,
  currentPath,
  className,
}: {
  logo: React.ReactNode;
  logoHref?: string;
  logoLabel?: string;
  announcement?: { text: React.ReactNode; href?: string };
  items?: NavItem[];
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
  /** The page's path, so its link reads as current. */
  currentPath?: string;
  className?: string;
}) {
  const headerRef = React.useRef<HTMLElement>(null);

  // Set on the element directly, so scrolling never re-renders the header.
  React.useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const sync = () => {
      const scrolled = String(window.scrollY > 0);
      if (header.dataset.scrolled !== scrolled) header.dataset.scrolled = scrolled;
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <>
      {announcement && <HeaderAnnouncement text={announcement.text} href={announcement.href} />}
      <header ref={headerRef} data-slot="site-header" data-scrolled="false" className={cn("group/header sticky top-0 z-1000 isolate w-full", className)}>
        {/* The bar's surface is its own layer, so it can change shape without moving the content. Its radius eases to
            3rem rather than the pill radius: past half the bar's height the ends are fully round, and a huge radius
            would snap round in the first frame instead of easing in. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-none border-0 border-transparent bg-surface/85 bg-clip-padding backdrop-blur-[var(--ds-space-4)]",
            "transition-[top,bottom,left,right,inset-inline,border-width,border-color,border-radius,background-color,box-shadow] duration-300 ease-out motion-reduce:transition-none",
            "group-data-[scrolled=true]/header:top-2 group-data-[scrolled=true]/header:-bottom-1 group-data-[scrolled=true]/header:inset-x-[calc((100%-min(100%-var(--ds-space-6),var(--ds-frame-column)))/2)]",
            "group-data-[scrolled=true]/header:rounded-[var(--ds-space-12)] group-data-[scrolled=true]/header:border-6 group-data-[scrolled=true]/header:border-ring-tint group-data-[scrolled=true]/header:bg-surface group-data-[scrolled=true]/header:shadow-floating",
          )}
        />
        <div className="mx-auto grid h-18 w-[min(100%-var(--ds-space-6),var(--ds-frame-column))] grid-cols-[1fr_auto] items-center gap-3 px-[calc(var(--ds-space-1-5)+var(--ds-space-2))] transition-transform duration-300 ease-out group-data-[scrolled=true]/header:translate-y-1.5 motion-reduce:transition-none lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* The pill's round end curves in beside the logo, so the logo keeps an extra inset in both states. */}
          <a href={logoHref} aria-label={logoLabel} className="flex items-center justify-self-start rounded-control pl-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {logo}
          </a>
          <DesktopNav items={items} currentPath={currentPath} />
          <div className="hidden items-center gap-2 justify-self-end lg:flex">
            {secondaryAction && (
              <Button asChild variant="outline" className="h-10.5 rounded-pill border-hairline bg-surface px-5 text-body-sm text-fg shadow-key hover:border-hairline hover:bg-subtle">
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              </Button>
            )}
            {primaryAction && (
              <Button asChild variant="pill" size="sm" className="h-10.5 px-5 py-0">
                <a href={primaryAction.href}>{primaryAction.label}</a>
              </Button>
            )}
          </div>
          <MobileNav items={items} primaryAction={primaryAction} secondaryAction={secondaryAction} currentPath={currentPath} />
        </div>
      </header>
    </>
  );
}

export { SiteHeader, type NavItem, type NavLink, type NavMenu, type NavMenuItem, type HeaderAction };
