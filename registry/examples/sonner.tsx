"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export function Product() {
  return (
    <>
      <Toaster />
      <Button variant="outline" onClick={() => toast("Key created", { description: "Copy it now; it won't be shown again." })}>
        Show a toast
      </Button>
    </>
  );
}
