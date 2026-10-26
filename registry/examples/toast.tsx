"use client";

import { Button } from "@/components/ui/button";
import { ToastAction, Toaster, toast } from "@/components/ui/toast";

export function Site() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="pill-outline" size="sm" onClick={() => toast({ title: "Subscribed", description: "You will get the changelog every month." })}>
        Subscribe
      </Button>
      <Toaster />
    </div>
  );
}

export function Product() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Key revoked",
            description: "Production stops working at once.",
            action: (
              <ToastAction altText="Undo the revoke" onClick={() => toast({ title: "Key restored" })}>
                Undo
              </ToastAction>
            ),
          })
        }
      >
        Revoke key
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            variant: "destructive",
            title: "Batch failed",
            description: "12 of 400 URLs could not be fetched.",
            action: <ToastAction altText="Retry the failed URLs">Retry</ToastAction>,
          })
        }
      >
        Run batch
      </Button>
      <Toaster />
    </div>
  );
}
