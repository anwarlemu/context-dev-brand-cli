"use client";

import { Building2, FileSearch, Globe, Radar } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const PRODUCTS = [
  { title: "Brand API", description: "Logos, colors and fonts for any domain.", icon: Building2, href: "#brand" },
  { title: "Scrape API", description: "Clean markdown from any page, JavaScript and all.", icon: FileSearch, href: "#scrape" },
  { title: "Monitor API", description: "Know when a page changes, with a diff.", icon: Radar, href: "#monitor" },
  { title: "Crawl API", description: "Every page of a site, mapped and fetched.", icon: Globe, href: "#crawl" },
];

const RESOURCES = [
  { title: "Documentation", description: "Guides and the API reference.", href: "#docs" },
  { title: "Changelog", description: "What shipped this month.", href: "#changelog" },
  { title: "Status", description: "Uptime and incidents.", href: "#status" },
];

function Menu({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(36rem,calc(100vw-3rem))] gap-0.5 sm:grid-cols-2">
              {PRODUCTS.map(({ title, description, icon: Icon, href }) => (
                <li key={title}>
                  <NavigationMenuLink href={href}>
                    <NavigationMenuIcon>
                      <Icon strokeWidth={1.75} />
                    </NavigationMenuIcon>
                    <span className="grid gap-0.5">
                      <span className="text-body font-medium text-fg">{title}</span>
                      <span>{description}</span>
                    </span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(18rem,calc(100vw-3rem))] gap-0.5">
              {RESOURCES.map(({ title, description, href }) => (
                <li key={title}>
                  <NavigationMenuLink href={href} className="flex-col gap-0.5">
                    <span className="text-body font-medium text-fg">{title}</span>
                    <span>{description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing" className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function Site() {
  return (
    <div className="flex min-h-96 w-full justify-center">
      <Menu />
    </div>
  );
}

export function Product() {
  return (
    <div className="flex min-h-80 w-full justify-center">
      <Menu />
    </div>
  );
}

export function Open() {
  return (
    <div className="flex min-h-96 w-full justify-center">
      <Menu defaultValue="products" />
    </div>
  );
}
