"use client";

import { AppTopBar } from "@/components/product/app-top-bar";
import { CreditsMenu } from "@/components/product/credits-menu";
import { PageHeader } from "@/components/product/page";

// The bar straight on the canvas, as wide as the page: no fill, no border and no title, only the credits at the right
// (and the menu button on phones). The page under it carries its own title.
export function Product() {
  return (
    <div className="w-full">
      <AppTopBar onMenuClick={() => {}}>
        <CreditsMenu remaining={6420} total={10000} plan={{ name: "Starter", price: "$19/month", resetLabel: "Nov 1" }} onUpgrade={() => {}} />
      </AppTopBar>
      <PageHeader title="Overview" className="pt-4" />
    </div>
  );
}
