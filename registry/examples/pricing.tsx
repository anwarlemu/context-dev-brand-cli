"use client";

import * as React from "react";

import { PricingCard, PricingGrid, PricingToggle, type BillingPeriod, type PricingFeature } from "@/components/site/pricing";
import { Button } from "@/components/ui/button";

// Context.dev's self-serve catalog (the branch's lib/pricing.ts) plus Enterprise. Yearly is ten months' price.
type Plan = {
  name: string;
  description: string;
  monthly?: number;
  credits?: number;
  overage?: string;
  concurrency?: string;
  features: PricingFeature[];
  cta: string;
  featured?: boolean;
};

const SCRAPE_HINT = "1 credit per page at the base rate";
const INCLUDED_HINT = "JavaScript rendering, anti-bot bypass, and premium proxies are part of the base scrape price, with no add-on fees";
const MONITOR_HINT = "Watch pages, sitemaps, or extracted data for changes. Each run costs 1 credit for page or sitemap targets, or 10 for extract targets";
const LOGO_HINT = "Separate quota via Logo Link, not deducted from your credits";

const plans: Plan[] = [
  {
    name: "Free Tier",
    description: "For exploring the APIs and testing your first ideas.",
    monthly: 0,
    credits: 1_000,
    overage: "No overage",
    concurrency: "1 concurrent request",
    features: [{ text: "Scrape 1,000 pages", hint: SCRAPE_HINT }, { text: "JS rendering & proxies included", hint: INCLUDED_HINT }, { text: "10 monitors", hint: MONITOR_HINT }, "1 concurrent batch", "Email support", { text: "Pull 10K logos (one-time quota)", hint: LOGO_HINT }],
    cta: "Get started",
  },
  {
    name: "Developer",
    description: "For side projects, MVPs, and lightweight apps.",
    monthly: 19,
    credits: 7_500,
    overage: "$2.20 per 1,000 credits overage",
    concurrency: "10 concurrent requests",
    features: [{ text: "Scrape 7,500 pages", hint: SCRAPE_HINT }, { text: "JS rendering & proxies included", hint: INCLUDED_HINT }, "750 Answers in Fast mode", { text: "100 monitors", hint: MONITOR_HINT }, "2 concurrent batches", "Email support", "Usage alerts", { text: "Pull 100K logos", hint: LOGO_HINT }],
    cta: "Start building",
  },
  {
    name: "Pro",
    description: "For production apps and AI agents powered by web data.",
    monthly: 99,
    credits: 125_000,
    overage: "$1.80 per 1,000 credits overage",
    concurrency: "100 concurrent requests",
    features: [{ text: "Scrape 125,000 pages", hint: SCRAPE_HINT }, { text: "JS rendering & proxies included", hint: INCLUDED_HINT }, "12,500 Answers in Fast mode", { text: "1,000 monitors", hint: MONITOR_HINT }, "5 concurrent batches", "Email + Slack support", "Spend controls", { text: "Pull 2.5M logos", hint: LOGO_HINT }],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Growth",
    description: "For growing products that need more data, more often.",
    monthly: 299,
    credits: 500_000,
    overage: "$1.40 per 1,000 credits overage",
    concurrency: "250 concurrent requests",
    features: [{ text: "Scrape 500,000 pages", hint: SCRAPE_HINT }, { text: "JS rendering & proxies included", hint: INCLUDED_HINT }, "50,000 Answers in Fast mode", { text: "5,000 monitors", hint: MONITOR_HINT }, "5 concurrent batches", "Priority support", { text: "Pull 5M logos", hint: LOGO_HINT }],
    cta: "Start Growth",
  },
  {
    name: "Scale",
    description: "For large datasets, bulk scraping, and continuous monitoring.",
    monthly: 499,
    credits: 1_000_000,
    overage: "$1.00 per 1,000 credits overage",
    concurrency: "500 concurrent requests",
    features: [{ text: "Scrape 1,000,000 pages", hint: SCRAPE_HINT }, { text: "JS rendering & proxies included", hint: INCLUDED_HINT }, "100,000 Answers in Fast mode", { text: "10,000 monitors", hint: MONITOR_HINT }, "20 concurrent batches", "SSO / SAML", "Priority + Slack support", "Custom usage alerts", { text: "Pull 10M logos", hint: LOGO_HINT }],
    cta: "Start Scale",
  },
  {
    name: "Enterprise",
    description: "For teams with custom volume, security, and compliance requirements.",
    features: ["Custom rate and monitor limits", "SSO, SAML and SCIM provisioning", "99.9% uptime SLA", "Annual invoicing, MSA and DPA", "Dedicated Slack channel", "Custom support and implementation help"],
    cta: "Book demo",
  },
];

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export function Site() {
  const [billing, setBilling] = React.useState<BillingPeriod>("monthly");

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <PricingToggle value={billing} onValueChange={setBilling} />
      <PricingGrid columns={3} className="w-full">
        {plans.map((plan) => {
          const custom = plan.monthly === undefined;
          const yearly = billing === "yearly" && !custom && plan.monthly! > 0;
          const annual = (plan.monthly ?? 0) * 10;
          return (
            <PricingCard
              key={plan.name}
              name={plan.name}
              description={plan.description}
              price={custom ? "Custom" : money(yearly ? Math.round(annual / 12) : plan.monthly!)}
              period={custom ? undefined : "/month"}
              note={yearly ? `${money(annual)}/yr` : undefined}
              noteHighlight={yearly ? `Save ${money(plan.monthly! * 12 - annual)}` : undefined}
              featured={plan.featured}
              cta={
                <Button asChild variant={plan.featured ? "pill" : "pill-outline"} className="py-2.5">
                  <a href={custom ? "https://cal.com/context-dev/30min" : "/signup"}>{plan.cta}</a>
                </Button>
              }
              quota={custom ? ["2M+ credits per month", "Volume discounts"] : [`${plan.credits!.toLocaleString("en-US")} credits per month`, plan.overage!, plan.concurrency!]}
              features={plan.features}
            />
          );
        })}
      </PricingGrid>
    </div>
  );
}
