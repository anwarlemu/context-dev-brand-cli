"use client";

import { AppTopBar } from "@/components/product/app-top-bar";
import { CreditsMenu } from "@/components/product/credits-menu";

export function Product() {
  return (
    <div className="w-full max-w-2xl rounded-card border border-line bg-canvas">
      <AppTopBar onMenuClick={() => {}}>
        <CreditsMenu remaining={6420} total={10000} plan={{ name: "Starter", price: "$19/month", resetLabel: "Nov 1" }} onUpgrade={() => {}} />
      </AppTopBar>
    </div>
  );
}
