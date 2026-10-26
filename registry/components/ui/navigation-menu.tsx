"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Navigation with panels, drawn as the site header's menus (website src/components/layout/navbar.tsx; the library's
// site-header): pill triggers in medium body-sm, nav gray turning brand blue under the pointer and black while open, a
// 16px chevron that turns over (200ms ease-out). The panel hangs below in the site's ring: a solid blue-10 band around a
// white card with card corners and the floating shadow, growing from its trigger in a short pop and resizing to each
// panel. Links inside are the menu's rows: card corners, 12px in, a medium title over a nav-gray line, with an optional
// blue tile icon, washing gray under the pointer.
function NavigationMenu({ className, children, viewport = true, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root data-slot="navigation-menu" data-viewport={viewport} className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)} {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" className={cn("group flex flex-1 list-none items-center justify-center gap-0.5", className)} {...props} />;
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex w-max cursor-pointer items-center justify-center gap-1 rounded-pill px-3.5 py-2 text-body-sm leading-5 font-medium whitespace-nowrap text-fg-nav outline-none transition-colors duration-150 ease-out hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 data-[active]:text-fg data-[state=open]:text-fg data-[state=open]:hover:text-fg motion-reduce:transition-none",
);

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), className)} {...props}>
      {children}
      <ChevronDown aria-hidden className="size-4 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-1.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-3 group-data-[viewport=false]/navigation-menu:rounded-card group-data-[viewport=false]/navigation-menu:bg-surface group-data-[viewport=false]/navigation-menu:shadow-floating group-data-[viewport=false]/navigation-menu:ring-6 group-data-[viewport=false]/navigation-menu:ring-tint group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-pop-in",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-1/2 isolate z-50 flex -translate-x-1/2 justify-center md:left-0 md:translate-x-0">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative mt-3 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-card bg-surface text-fg shadow-floating ring-6 ring-tint transition-[width,height] duration-200 ease-out data-[state=open]:animate-pop-in md:origin-top-left motion-reduce:transition-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-start gap-3 rounded-card p-3 text-body-sm leading-snug text-fg-nav outline-none transition-colors duration-150 ease-out hover:bg-wash-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring data-[active=true]:bg-wash-hover motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** The blue tile the site's menu rows lead with: a 36px square in brand blue holding one white 16px line icon. */
function NavigationMenuIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="navigation-menu-icon" className={cn("flex size-9 shrink-0 items-center justify-center rounded-control bg-brand text-on-brand [&>svg]:size-4", className)} {...props} />;
}

function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator data-slot="navigation-menu-indicator" className={cn("top-full z-10 flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-fade-in", className)} {...props}>
      <div className="relative top-[60%] size-2.5 rotate-45 rounded-tl-sm bg-tint" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
