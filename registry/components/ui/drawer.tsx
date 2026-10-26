"use client";

import * as React from "react";
import * as DrawerPrimitive from "@radix-ui/react-dialog";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A drawer pulled from an edge, drawn as the dashboard's phone drawer (the app sidebar below 768px): a white panel with
// shell corners and the drawer shadow, held 8px off the window's edges over the scrim, with a 40 by 4px handle in the
// line gray. It slides its full size in (250ms, the strong ease-out) and leaves with the sheet's short slide and fade.
// It can be dragged away: a flick faster than 0.11px per ms, or a pull past a third of its size, closes it; a shorter
// pull springs back; pulling the other way meets growing resistance instead of a wall. The drag follows the pointer off
// the panel (pointer capture) and ignores a second finger. Mark a scrolling area inside with data-drawer-no-drag.
type Direction = "bottom" | "top" | "left" | "right";

const DrawerContext = React.createContext<{ direction: Direction; setOpen: (open: boolean) => void }>({ direction: "bottom", setOpen: () => {} });

function Drawer({ open: openProp, defaultOpen = false, onOpenChange, direction = "bottom", ...props }: React.ComponentProps<typeof DrawerPrimitive.Root> & { direction?: Direction }) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  return (
    <DrawerContext.Provider value={{ direction, setOpen }}>
      <DrawerPrimitive.Root data-slot="drawer" open={open} onOpenChange={setOpen} {...props} />
    </DrawerContext.Provider>
  );
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  const container = usePortalContainer();
  return <DrawerPrimitive.Portal data-slot="drawer-portal" container={container} {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={cn("fixed inset-0 z-50 animate-fade-in bg-scrim", className)} {...props} />;
}

const PLACE: Record<Direction, string> = {
  bottom: "inset-x-2 bottom-2 max-h-[85dvh] flex-col starting:translate-y-[calc(100%+0.5rem)] data-[state=closed]:animate-sheet-bottom-out",
  top: "inset-x-2 top-2 max-h-[85dvh] flex-col-reverse starting:-translate-y-[calc(100%+0.5rem)]",
  right: "inset-y-2 right-2 w-[min(24rem,calc(100%-3rem))] flex-row-reverse starting:translate-x-[calc(100%+0.5rem)] data-[state=closed]:animate-sheet-right-out",
  left: "inset-y-2 left-2 w-[min(24rem,calc(100%-3rem))] flex-row starting:-translate-x-[calc(100%+0.5rem)] data-[state=closed]:animate-sheet-left-out",
};

// Where a pull closes the drawer: toward its own edge (positive for bottom and right).
const AXIS: Record<Direction, { axis: "x" | "y"; sign: 1 | -1 }> = { bottom: { axis: "y", sign: 1 }, top: { axis: "y", sign: -1 }, right: { axis: "x", sign: 1 }, left: { axis: "x", sign: -1 } };
const VELOCITY = 0.11;
const SKIP = "button, a, input, textarea, select, [role=slider], [contenteditable=true], [data-drawer-no-drag]";

function useDrag(direction: Direction, close: () => void) {
  const panel = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ id: number; start: number; at: number; time: number } | null>(null);
  const { axis, sign } = AXIS[direction];
  const translate = (px: number) => (axis === "y" ? `translateY(${px}px)` : `translateX(${px}px)`);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current || event.button !== 0) return; // one pointer only
    if ((event.target as Element).closest(SKIP)) return;
    if (window.getSelection()?.toString()) return;
    const start = axis === "y" ? event.clientY : event.clientX;
    drag.current = { id: event.pointerId, start, at: 0, time: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (panel.current) panel.current.style.transition = "none";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId || !panel.current) return;
    const raw = (axis === "y" ? event.clientY : event.clientX) - d.start;
    const toward = raw * sign;
    // Toward the edge it follows the pointer; away from it, resistance grows with distance.
    const moved = toward >= 0 ? toward : -Math.sqrt(-toward) * 2;
    d.at = moved;
    panel.current.style.transform = translate(moved * sign);
  };

  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId || !panel.current) return;
    drag.current = null;
    const el = panel.current;
    const size = axis === "y" ? el.offsetHeight : el.offsetWidth;
    const velocity = Math.abs(d.at) / Math.max(1, performance.now() - d.time);
    if (d.at > 0 && (d.at > size / 3 || velocity > VELOCITY)) {
      el.style.transition = "";
      close();
      return;
    }
    el.style.transition = "transform 300ms var(--ds-easing-out)";
    el.style.transform = "";
    const reset = () => {
      el.style.transition = "";
      el.removeEventListener("transitionend", reset);
    };
    el.addEventListener("transitionend", reset);
  };

  return { panel, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } };
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const { direction, setOpen } = React.useContext(DrawerContext);
  const { panel, handlers } = useDrag(direction, () => setOpen(false));
  const vertical = direction === "bottom" || direction === "top";
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={panel}
        data-slot="drawer-content"
        data-direction={direction}
        className={cn(
          "group/drawer fixed z-50 flex touch-none rounded-shell bg-surface text-fg shadow-drawer outline-none transition-[translate] duration-250 ease-emphasized motion-reduce:transition-none motion-reduce:starting:translate-0",
          PLACE[direction],
          className,
        )}
        {...handlers}
        {...props}
      >
        <div aria-hidden data-slot="drawer-handle" className={cn("shrink-0 rounded-pill bg-line", vertical ? "mx-auto my-2.5 h-1 w-10" : "mx-2.5 my-auto h-10 w-1")} />
        <div className="ds-scrollbar flex min-h-0 min-w-0 flex-1 touch-auto flex-col overflow-auto">{children}</div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-header" className={cn("flex flex-col gap-1.5 px-5 pt-2 pb-4 group-data-[direction=left]/drawer:pt-5 group-data-[direction=right]/drawer:pt-5", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 border-t border-line-subtle px-5 py-3.5", className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("text-h5 leading-snug font-normal tracking-normal text-fg", className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger };
