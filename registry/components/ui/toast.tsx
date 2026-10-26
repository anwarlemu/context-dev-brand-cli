"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// The Radix toast (shadcn's older toast API; prefer the Sonner toaster for new work), in the brand's toast look
// (the website's sonner.tsx): white with a light border and the floating shadow, body-sm, the title in black at weight
// 500 over a muted description, a small outline action and a quiet close glyph, stacked at the bottom center as the
// brand's toasts sit. `destructive` turns the title and the action red. A toast rises 8px as it fades in (200ms
// ease-out) and leaves with a short slide down; a swipe down drags it with the finger and lets it go.
const ToastProvider = ToastPrimitive.Provider;

function ToastViewport({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn("fixed bottom-0 left-1/2 z-[100] flex max-h-dvh w-full max-w-sm -translate-x-1/2 flex-col gap-2 p-4 outline-none", className)}
      {...props}
    />
  );
}

const toastVariants = cva(
  "group/toast pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-card border border-line bg-surface p-4 pr-10 font-sans text-body-sm text-fg shadow-floating transition-[opacity,translate] duration-200 ease-out starting:translate-y-2 starting:opacity-0 data-[state=closed]:animate-sheet-bottom-out data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-[translate] data-[swipe=end]:translate-y-(--radix-toast-swipe-end-y) data-[swipe=end]:animate-sheet-bottom-out data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y) data-[swipe=move]:transition-none motion-reduce:transition-none motion-reduce:starting:translate-y-0",
  {
    variants: {
      variant: {
        default: "",
        destructive: "[&_[data-slot=toast-title]]:text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Toast({ className, variant, ...props }: React.ComponentProps<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>) {
  return <ToastPrimitive.Root data-slot="toast" data-variant={variant ?? "default"} className={cn(toastVariants({ variant }), className)} {...props} />;
}

function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center self-center rounded-control border border-line-strong bg-surface px-3 text-body-sm whitespace-nowrap text-fg outline-none transition-[border-color,color,scale] duration-150 ease-out hover:border-fg active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=destructive]/toast:border-danger group-data-[variant=destructive]/toast:text-danger motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close"
      className={cn("absolute top-3 right-3 grid size-6 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none", className)}
      {...props}
    >
      <X className="size-4" strokeWidth={1.5} />
    </ToastPrimitive.Close>
  );
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("text-body-sm font-medium text-fg", className)} {...props} />;
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return <ToastPrimitive.Description data-slot="toast-description" className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}

type ToastProps = React.ComponentProps<typeof Toast>;
type ToastActionElement = React.ReactElement<React.ComponentProps<typeof ToastAction>>;

// The toast queue: a tiny store any part of the app can push to with toast(), read by useToast() and <Toaster />.
const TOAST_LIMIT = 3;
const REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & { id: string; title?: React.ReactNode; description?: React.ReactNode; action?: ToastActionElement };
type State = { toasts: ToasterToast[] };

let count = 0;
const nextId = () => String((count = (count + 1) % Number.MAX_SAFE_INTEGER));
const listeners: Array<(state: State) => void> = [];
let memory: State = { toasts: [] };
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function setState(update: (state: State) => State) {
  memory = update(memory);
  listeners.forEach((l) => l(memory));
}

function scheduleRemove(id: string) {
  if (timeouts.has(id)) return;
  timeouts.set(id, setTimeout(() => {
    timeouts.delete(id);
    setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  }, REMOVE_DELAY));
}

function dismiss(id?: string) {
  setState((s) => ({ toasts: s.toasts.map((t) => (id === undefined || t.id === id ? { ...t, open: false } : t)) }));
  memory.toasts.filter((t) => id === undefined || t.id === id).forEach((t) => scheduleRemove(t.id));
}

function toast(props: Omit<ToasterToast, "id">) {
  const id = nextId();
  const update = (next: Partial<ToasterToast>) => setState((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, ...next } : t)) }));
  setState((s) => ({
    toasts: [{ ...props, id, open: true, onOpenChange: (open: boolean) => { if (!open) dismiss(id); props.onOpenChange?.(open); } }, ...s.toasts].slice(0, TOAST_LIMIT),
  }));
  return { id, dismiss: () => dismiss(id), update };
}

function useToast() {
  const [state, setLocal] = React.useState(memory);
  React.useEffect(() => {
    listeners.push(setLocal);
    return () => {
      const i = listeners.indexOf(setLocal);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast, dismiss };
}

/** Renders the queue. Mount it once, near the root. */
function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider swipeDirection="down">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid min-w-0 gap-0.5">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export { Toast, ToastAction, ToastClose, ToastDescription, Toaster, ToastProvider, ToastTitle, ToastViewport, toast, useToast };
export type { ToastActionElement, ToastProps };
