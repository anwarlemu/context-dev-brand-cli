"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// shadcn's sidebar, drawn as the dashboard's (context-dashboard src/components/shell/sidebar.tsx; the library's
// app-sidebar): on the canvas with no border or fill of its own, 212px wide, its rows 28px in from the edges. A row is
// 32px with control corners: a 16px icon at stroke 1.75 in the subtle gray, 10px from the page's name in muted body-sm;
// hovering washes it and darkens both, and the page you are on sits in the neutral gray selected wash (never blue) at
// weight 500, changing at once. A group is named by a small outlined tag in sentence case. The header sits level with
// the top bar; the foot (Help, Documentation, the account) closes the rail. Below 768px the rail is the dashboard's
// white drawer over the scrim, 8px off the window's edges, closing on Escape and on the scrim. Collapsing to icons
// narrows it to 64px (200ms ease-out) with each row's name in a tooltip; Cmd or Ctrl B toggles it at once, with no motion.
const SIDEBAR_WIDTH = "var(--ds-layout-sidebar)";
const SIDEBAR_WIDTH_ICON = "4rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_QUERY = "(max-width: 767px)";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/**
 * Holds whether the rail is open (expanded or collapsed on a desktop, shown as a drawer on a phone). Uncontrolled with
 * `defaultOpen`, or controlled with `open` and `onOpenChange`. Nothing is stored: keep the state yourself if it should
 * survive a reload. Cmd or Ctrl and B toggles it.
 */
function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }: React.ComponentProps<"div"> & { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [instant, setInstant] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;
      if (setOpenProp) setOpenProp(next);
      else setInternalOpen(next);
    },
    [setOpenProp, open],
  );
  const toggleSidebar = React.useCallback(() => {
    setInstant(false);
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    // A shortcut is pressed many times a day: it changes the rail at once, with no motion.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== SIDEBAR_KEYBOARD_SHORTCUT || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setInstant(true);
      if (isMobile) setOpenMobile((o) => !o);
      else setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, setOpen]);

  const state = open ? "expanded" : "collapsed";
  const value = React.useMemo<SidebarContextProps>(() => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }), [state, open, setOpen, isMobile, openMobile, toggleSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        data-instant={instant || undefined}
        style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full bg-canvas", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/**
 * The rail. `variant`: sidebar (the dashboard's, on the canvas), floating (a white card on the canvas, 8px from the
 * edges) or inset (the rail on the canvas with the page as a white card beside it). `collapsible`: offcanvas (slides
 * away), icon (narrows to its icons) or none.
 */
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { side?: "left" | "right"; variant?: "sidebar" | "floating" | "inset"; collapsible?: "offcanvas" | "icon" | "none" }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const container = usePortalContainer();

  if (collapsible === "none") {
    return (
      <div data-slot="sidebar" data-variant={variant} className={cn("group/sidebar flex h-full w-(--sidebar-width) flex-col bg-canvas text-fg", className)} {...props}>
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <DialogPrimitive.Portal container={container}>
          <DialogPrimitive.Overlay className={cn("inset-0 z-40 animate-fade-in bg-scrim", container ? "absolute" : "fixed")} />
          <DialogPrimitive.Content
            data-slot="sidebar"
            data-sidebar="sidebar"
            data-mobile="true"
            data-variant={variant}
            className={cn(
              "group/sidebar inset-y-2 z-50 flex w-(--ds-layout-sidebar) max-w-[calc(100%-3rem)] flex-col rounded-shell bg-surface text-fg shadow-drawer outline-none transition-[translate] duration-250 ease-emphasized motion-reduce:transition-none",
              container ? "absolute" : "fixed",
              side === "left" ? "left-2 starting:-translate-x-[calc(100%+1rem)] data-[state=closed]:animate-sheet-left-out" : "right-2 starting:translate-x-[calc(100%+1rem)] data-[state=closed]:animate-sheet-right-out",
              className,
            )}
          >
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">The app&apos;s pages and settings.</DialogPrimitive.Description>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <div data-slot="sidebar" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side} className="group/sidebar peer hidden shrink-0 text-fg md:block">
      {/* Holds the rail's room in the row, so the page beside it moves as it opens and closes. */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative h-full w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-out group-data-[collapsible=offcanvas]/sidebar:w-0 group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon) in-data-[instant=true]:transition-none motion-reduce:transition-none",
          variant !== "sidebar" && "group-data-[collapsible=icon]/sidebar:w-[calc(var(--sidebar-width-icon)+var(--ds-space-4))]",
        )}
      >
        <div
          data-slot="sidebar-container"
          className={cn(
            "sticky top-0 z-10 flex h-svh max-h-full w-(--sidebar-width) overflow-hidden transition-[translate,width] duration-200 ease-out in-data-[instant=true]:transition-none motion-reduce:transition-none",
            side === "left" ? "left-0 group-data-[collapsible=offcanvas]/sidebar:-translate-x-full" : "ml-auto group-data-[collapsible=offcanvas]/sidebar:translate-x-full",
            variant !== "sidebar" ? "p-2 group-data-[collapsible=icon]/sidebar:w-[calc(var(--sidebar-width-icon)+var(--ds-space-4))]" : "group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon)",
            className,
          )}
          {...props}
        >
          <div data-sidebar="sidebar" data-slot="sidebar-inner" className={cn("flex h-full w-full flex-col bg-canvas", variant === "floating" && "rounded-shell bg-surface shadow-card")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The menu button: a 32px ghost square with the panel icon, as the dashboard's top bar opens its drawer. */
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  return (
    <button
      type="button"
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      aria-expanded={isMobile ? openMobile : open}
      aria-label="Toggle the sidebar"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-control text-fg-muted outline-none transition-colors duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none [&>svg]:size-4",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft strokeWidth={1.5} />
    </button>
  );
}

/** A thin strip along the rail's edge that toggles it, with a hairline that shows under the pointer. */
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle the sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle the sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-transparent after:transition-colors after:duration-150 after:ease-out hover:after:bg-line sm:flex",
        "in-data-[side=left]:-right-4 in-data-[side=left]:cursor-w-resize in-data-[side=right]:left-0 in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        className,
      )}
      {...props}
    />
  );
}

/** The page beside the rail. With the inset rail it is a white card with shell corners, 8px from the edges. */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("relative flex w-full min-w-0 flex-1 flex-col bg-canvas", "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-shell md:peer-data-[variant=inset]:bg-surface md:peer-data-[variant=inset]:shadow-card", className)}
      {...props}
    />
  );
}

function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input data-slot="sidebar-input" data-sidebar="input" className={cn("h-8", className)} {...props} />;
}

/** The rail's head, level with the top bar: the workspace switcher and the search button. */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" data-sidebar="header" className={cn("flex shrink-0 flex-col gap-2 px-7 pt-6 pb-2 group-data-[collapsible=icon]/sidebar:px-4 group-data-[mobile=true]/sidebar:px-4 group-data-[mobile=true]/sidebar:pt-4", className)} {...props} />;
}

/** The rail's foot: Help, Documentation and the account. */
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn("flex shrink-0 flex-col gap-0.5 px-7 pt-2 pb-5.5 group-data-[collapsible=icon]/sidebar:px-4 group-data-[mobile=true]/sidebar:px-4 group-data-[mobile=true]/sidebar:pb-4", className)} {...props} />;
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" data-sidebar="separator" className={cn("mx-7 my-1 w-auto group-data-[collapsible=icon]/sidebar:mx-4", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn("ds-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto overscroll-contain py-0.5 group-data-[collapsible=icon]/sidebar:overflow-hidden", className)}
      {...props}
    />
  );
}

/** A group of rows, 28px in from the rail's edges. */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group" data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col px-7 group-data-[collapsible=icon]/sidebar:px-4 group-data-[mobile=true]/sidebar:px-4", className)} {...props} />;
}

/** A group's name: a small outlined tag in sentence case (not a control); it folds away when the rail shows icons only. */
function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "mt-3 mb-1 ml-3 w-fit shrink-0 rounded-tag border border-line px-1.5 py-px font-sans text-axis leading-4 whitespace-nowrap text-fg-muted outline-none transition-[margin,opacity] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring group-data-[collapsible=icon]/sidebar:-mt-5 group-data-[collapsible=icon]/sidebar:opacity-0 motion-reduce:transition-none [&>svg]:size-3 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/** A group's action beside its tag (adding a monitor): a 24px quiet square with a 14px icon. */
function SidebarGroupAction({ className, asChild = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute top-2.5 right-8 grid size-6 cursor-pointer place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring group-data-[collapsible=icon]/sidebar:hidden group-data-[mobile=true]/sidebar:right-5 motion-reduce:transition-none [&>svg]:size-3.5 [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn("w-full", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />;
}

// The dashboard's row. Narrowed to icons it is a 32px square around its icon. Changing the current row is instant.
const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/link flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-control pr-2 pl-3 text-left text-body-sm text-fg-muted no-underline outline-none transition-colors duration-150 ease-out group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]/sidebar:size-8! group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:p-0! group-data-[collapsible=icon]/sidebar:[&>span:not([data-slot=avatar])]:sr-only focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-wash-selected data-[active=true]:font-medium data-[active=true]:text-neutral-80 data-[state=open]:bg-wash-hover data-[state=open]:text-fg motion-reduce:transition-none [&>span:last-child]:truncate [&>svg]:shrink-0 [&>svg]:stroke-[1.75] [&>svg]:text-fg-subtle [&>svg]:transition-colors [&>svg]:duration-150 [&>svg:not([class*='size-'])]:size-4 hover:[&>svg]:text-fg-muted data-[active=true]:[&>svg]:text-neutral-80",
  {
    variants: {
      variant: {
        default: "hover:bg-wash-hover hover:text-fg",
        outline: "bg-surface shadow-card hover:bg-wash-hover hover:text-fg",
      },
      size: {
        default: "h-8",
        sm: "h-7 text-caption",
        lg: "h-12 group-data-[collapsible=icon]/sidebar:p-0!",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; isActive?: boolean; tooltip?: string | React.ComponentProps<typeof TooltipContent> } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  // The tooltip names a row only while the rail shows icons alone; otherwise it stays shut, so it never catches Escape.
  const [tipOpen, setTipOpen] = React.useState(false);
  const showTip = state === "collapsed" && !isMobile;
  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
  if (!tooltip) return button;
  const content = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  return (
    <Tooltip open={showTip && tipOpen} onOpenChange={setTipOpen}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" {...content} />
    </Tooltip>
  );
}

/** An action at a row's right end (a row's menu). `showOnHover` keeps it hidden until the row is hovered or open. */
function SidebarMenuAction({ className, asChild = false, showOnHover = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean; showOnHover?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute top-1 right-1 grid size-6 cursor-pointer place-items-center rounded-control text-fg-subtle outline-none transition-[background-color,color,opacity] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring group-data-[collapsible=icon]/sidebar:hidden motion-reduce:transition-none [&>svg]:size-3.5 [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-0.5 peer-data-[size=lg]/menu-button:top-3",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-fg md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

/** A count or a short mark at a row's right end, in the subtle gray caption with tabular figures. */
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute top-1.5 right-2 flex h-5 min-w-5 items-center justify-center px-1 text-caption text-fg-subtle tabular-nums select-none group-data-[collapsible=icon]/sidebar:hidden",
        "peer-data-[size=sm]/menu-button:top-1 peer-data-[size=lg]/menu-button:top-3.5 peer-data-[active=true]/menu-button:text-neutral-80",
        className,
      )}
      {...props}
    />
  );
}

/** A row's placeholder while the rail loads: an icon square and a name of varying width, in the skeleton's sheen. */
function SidebarMenuSkeleton({ className, showIcon = false, ...props }: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  // A width between 50 and 90 percent that differs from row to row but is the same on the server and in the browser.
  const id = React.useId();
  const width = `${50 + ([...id].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 997, 7) % 41)}%`;
  return (
    <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn("flex h-8 items-center gap-2.5 rounded-control pr-2 pl-3", className)} {...props}>
      {showIcon && <Skeleton className="size-4" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="h-3 max-w-(--skeleton-width) flex-1" data-sidebar="menu-skeleton-text" style={{ "--skeleton-width": width } as React.CSSProperties} />
    </div>
  );
}

/** Rows nested under a row (Data APIs' endpoints), hung from a light line under the parent's icon. */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu-sub" data-sidebar="menu-sub" className={cn("mx-5 mt-0.5 flex min-w-0 flex-col gap-0.5 border-l border-line-subtle py-0.5 pl-2.5 group-data-[collapsible=icon]/sidebar:hidden", className)} {...props} />;
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />;
}

function SidebarMenuSubButton({ asChild = false, size = "md", isActive = false, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean; size?: "sm" | "md"; isActive?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-7 min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-control px-2.5 text-fg-muted no-underline outline-none transition-colors duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-wash-selected data-[active=true]:font-medium data-[active=true]:text-neutral-80 motion-reduce:transition-none [&>span:last-child]:truncate [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-fg-subtle",
        size === "sm" ? "text-caption" : "text-body-sm",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
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
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
