"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ROUTES: Record<string, string> = {
  "/": "/preview/overview-page/Block",
  "/api-keys": "/preview/table-page/Paid",
  "/usage": "/preview/usage-card/Product",
  "/settings": "/preview/settings-page/Block",
  "/monitors": "/preview/sheet/Product",
};

/** Route sample app links within the examples; marketing links go to the real website. */
export function PreviewRuntime({ surface }: { surface: "site" | "product" }) {
  const [destination, setDestination] = useState<string | null>(null);
  useEffect(() => {
    const navigate = (href: string) => {
      const url = new URL(href, window.location.href);
      if (surface === "site") { window.open(`https://context.dev${url.pathname}${url.search}${url.hash}`, "_blank", "noopener,noreferrer"); return; }
      const route = url.pathname.startsWith("/playground/") ? "/preview/playground-result-card/Ready"
        : url.pathname === "/settings" && url.searchParams.get("tab") === "billing" ? "/preview/settings-page/Billing"
        : url.pathname === "/settings" && url.searchParams.get("tab") === "organization" ? "/preview/settings-page/Organization"
        : url.pathname === "/settings" && url.searchParams.get("tab") === "referrals" ? "/preview/settings-page/Referrals"
        : ROUTES[url.pathname];
      if (route) window.location.assign(route);
      else setDestination(url.pathname);
    };
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      const href = link?.getAttribute("href");
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || !href?.startsWith("/") || href.startsWith("//") || href.startsWith("/preview/") || href.startsWith("/components/") || link?.hasAttribute("download")) return;
      event.preventDefault();
      navigate(href);
    };
    const action = (event: Event) => { event.preventDefault(); navigate((event as CustomEvent<{ href: string }>).detail.href); };
    const keyboard = (event: KeyboardEvent) => {
      if (window.parent === window) return;
      const search = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const back = event.shiftKey && event.key === "Escape" && !document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]');
      if (!search && !back) return;
      event.preventDefault();
      window.parent.postMessage({ type: "context-preview-shortcut", action: search ? "search" : "back" }, window.location.origin);
    };
    document.addEventListener("click", click);
    window.addEventListener("ds:navigate", action);
    window.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("click", click); window.removeEventListener("ds:navigate", action); window.removeEventListener("keydown", keyboard); };
  }, [surface]);
  return <Dialog open={destination !== null} onOpenChange={(open) => { if (!open) setDestination(null); }}><DialogContent><DialogHeader><DialogTitle>Navigation selected</DialogTitle><DialogDescription>This block opens the following route in your application.</DialogDescription></DialogHeader><DialogBody className="grid gap-4"><code className="text-body-sm">{destination}</code><Button onClick={() => setDestination(null)}>Return to example</Button></DialogBody></DialogContent></Dialog>;
}
