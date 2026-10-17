import { Gem } from "lucide-react";

import { AppTopBar } from "@/components/product/app-top-bar";
import { Button } from "@/components/ui/button";

export function Product() {
  return (
    <div className="w-full max-w-2xl rounded-card border border-line bg-canvas">
      <AppTopBar>
        <Button variant="outline" size="sm">
          <Gem strokeWidth={1.5} className="text-brand" /> 6,420 credits
        </Button>
      </AppTopBar>
    </div>
  );
}
