"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const showKeyCreated = () => toast("Key created", { id: "key-created", toasterId: "toast-example", description: "Copy it now; it won't be shown again.", duration: Infinity });

// A toast raised on load and held, in a Toaster pinned to this frame (`absolute` instead of the viewport's `fixed`) so
// it shows here. In an app, mount one <Toaster /> near the root and call toast() from anywhere.
export function Product() {
  useEffect(() => {
    showKeyCreated();
  }, []);
  return (
    <div className="relative flex h-48 justify-center">
      <Button variant="outline" onClick={showKeyCreated}>
        Create key
      </Button>
      <Toaster id="toast-example" style={{ position: "absolute" }} />
    </div>
  );
}
