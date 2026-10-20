"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";

import { useTabGlide } from "@/hooks/use-tab-glide";
import { cn } from "@/lib/utils";

// The dashboard's tabs: plain labels, with one soft gray pill (no border) that glides to the selected one on a spring.
// `segmented` sits them on a gray track with a white pill, so the unpicked ones still read as choices. Only the text
// answers a hover, so nothing fades over the pill gliding in beneath. The site's `pill` tabs sit in a white pill-shaped
// track with a hairline edge, a white pill outlined in brand blue gliding to the selected one (src/components/ui/tabs.tsx,
// the `brand` variant).
type Variant = "default" | "segmented" | "pill";
type Size = "sm" | "md";

// The track's inner corners: the control radius less the track's 2px padding, so the pill sits concentric in it.
const INNER_RADIUS = "rounded-[calc(var(--ds-radius-control)-0.125rem)]";
const SEGMENTED_SURFACE = "bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.03)]";
const PILL_SURFACE: Record<Variant, string> = {
  default: "bg-wash-pill",
  segmented: SEGMENTED_SURFACE,
  pill: "rounded-pill border border-brand bg-surface",
};
// The same surface on the selected trigger, for the first paint before the pill lands (or for a list with no pill).
const SELF_SURFACE: Record<Variant, string> = {
  default: "data-[state=active]:bg-wash-pill",
  segmented: "data-[state=active]:bg-surface data-[state=active]:shadow-[0_1px_3px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.03)]",
  pill: "data-[state=active]:border-brand data-[state=active]:bg-surface",
};

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-fg-subtle transition-[color] duration-200 ease-out hover:text-fg data-[state=active]:text-fg",
        segmented: "text-fg-muted transition-[color] duration-200 ease-out hover:text-fg data-[state=active]:text-fg",
        pill: "rounded-pill border border-transparent px-4 py-1.5 text-body-sm leading-snug text-fg-muted transition-[color] duration-200 ease-out hover:text-fg data-[state=active]:text-fg-brand",
      },
      size: { sm: "", md: "" },
    },
    compoundVariants: [
      { variant: "default", size: "md", className: "h-9 rounded-control px-4 text-body-sm" },
      { variant: "default", size: "sm", className: `h-7 px-3 text-caption ${INNER_RADIUS}` },
      { variant: "segmented", size: "md", className: `h-8 px-3.5 text-body-sm ${INNER_RADIUS}` },
      { variant: "segmented", size: "sm", className: `h-7 px-3 text-caption ${INNER_RADIUS}` },
    ],
    defaultVariants: { variant: "default", size: "md" },
  },
);

const ActiveValue = React.createContext<string | undefined>(undefined);
const ListState = React.createContext<{ variant: Variant; size: Size; isPillPlaced: boolean }>({ variant: "default", size: "md", isPillPlaced: false });

// The active value is mirrored here so the list can move its pill in the same render Radix switches tabs, whether the
// value is controlled or not.
function Tabs({ className, value, defaultValue, onValueChange, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const active = value ?? uncontrolled;
  return (
    <ActiveValue.Provider value={active}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={active}
        onValueChange={(next) => {
          setUncontrolled(next);
          onValueChange?.(next);
        }}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      />
    </ActiveValue.Provider>
  );
}

function TabsList({
  className,
  variant = "default",
  size = "md",
  glide = true,
  pillClassName,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: Variant;
  size?: Size;
  /** Off for lists whose triggers draw their own selected surface. */
  glide?: boolean;
  /** The gliding pill's surface, for a list styled its own way. */
  pillClassName?: string;
}) {
  const active = React.useContext(ActiveValue);
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const isPlaced = useTabGlide(pillRef, active ?? "");
  const listState = React.useMemo(() => ({ variant, size, isPillPlaced: glide && isPlaced }), [variant, size, glide, isPlaced]);
  const pillRadius = variant === "pill" ? "" : variant === "default" && size === "md" ? "rounded-control" : INNER_RADIUS;

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative isolate inline-flex w-fit items-center",
        variant === "pill" ? "gap-1 rounded-pill border border-neutral-10 bg-surface p-1" : variant === "segmented" ? "gap-0.5 rounded-control bg-neutral-5 p-0.5" : size === "sm" ? "gap-0.5" : "gap-1",
        className,
      )}
      {...props}
    >
      {glide && <span ref={pillRef} aria-hidden className={cn("pointer-events-none absolute top-0 left-0 -z-10", pillRadius, PILL_SURFACE[variant], pillClassName, !isPlaced && "invisible")} />}
      <ListState.Provider value={listState}>{children}</ListState.Provider>
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, value, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, size, isPillPlaced } = React.useContext(ListState);
  // Until the pill lands (or with no pill), the selected tab draws the surface itself, so the first paint matches.
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" data-tab-id={value} value={value} className={cn(tabsTriggerVariants({ variant, size }), !isPillPlaced && SELF_SURFACE[variant], className)} {...props} />;
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsTriggerVariants };
