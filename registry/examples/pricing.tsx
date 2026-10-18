"use client";

import * as React from "react";

import { ArrowRight } from "lucide-react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { CreditCostsTable, PricingBanner, PricingCard, PricingPlanFit, PricingShelves, PricingToggle, type BillingPeriod, type PricingFeature } from "@/components/site/pricing";
import { Button } from "@/components/ui/button";

// Context.dev's self-serve catalog (the branch's lib/pricing.ts) plus Enterprise. Yearly is ten months' price.
type Plan = {
  name: string;
  description: string;
  monthly?: number;
  credits?: number;
  overage?: string;
  /** The short form the card shows; the full text is its label. */
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
    concurrency: "2 concurrent requests",
    features: [
      { text: "Scrape 1,000 pages", hint: SCRAPE_HINT },
      { text: "JS rendering & proxies included", hint: INCLUDED_HINT },
      { text: "10 monitors", hint: MONITOR_HINT },
      "1 concurrent batch",
      "Email support",
      { text: "Pull 10K logos (one-time quota)", hint: LOGO_HINT },
    ],
    cta: "Get started",
  },
  {
    name: "Developer",
    description: "For side projects, MVPs, and lightweight apps.",
    monthly: 19,
    credits: 7_500,
    overage: "$2.20 per 1,000 credits overage",
    concurrency: "10 concurrent requests",
    features: [
      { text: "Scrape 7,500 pages", hint: SCRAPE_HINT },
      { text: "JS rendering & proxies included", hint: INCLUDED_HINT },
      "750 Answers in Fast mode",
      { text: "100 monitors", hint: MONITOR_HINT },
      "2 concurrent batches",
      "Email support",
      "Usage alerts",
      { text: "Pull 100K logos", hint: LOGO_HINT },
    ],
    cta: "Start building",
  },
  {
    name: "Pro",
    description: "For production apps and AI agents powered by web data.",
    monthly: 99,
    credits: 125_000,
    overage: "$1.80 per 1,000 credits overage",
    concurrency: "100 concurrent requests",
    features: [
      { text: "Scrape 125,000 pages", hint: SCRAPE_HINT },
      { text: "JS rendering & proxies included", hint: INCLUDED_HINT },
      "12,500 Answers in Fast mode",
      { text: "1,000 monitors", hint: MONITOR_HINT },
      "5 concurrent batches",
      "Email + Slack support",
      "Spend controls",
      { text: "Pull 2.5M logos", hint: LOGO_HINT },
    ],
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
    features: [
      { text: "Scrape 500,000 pages", hint: SCRAPE_HINT },
      { text: "JS rendering & proxies included", hint: INCLUDED_HINT },
      "50,000 Answers in Fast mode",
      { text: "5,000 monitors", hint: MONITOR_HINT },
      "5 concurrent batches",
      "Priority support",
      { text: "Pull 5M logos", hint: LOGO_HINT },
    ],
    cta: "Start Growth",
  },
  {
    name: "Scale",
    description: "For large datasets, bulk scraping, and continuous monitoring.",
    monthly: 499,
    credits: 1_000_000,
    overage: "$1.00 per 1,000 credits overage",
    concurrency: "500 concurrent requests",
    features: [
      { text: "Scrape 1,000,000 pages", hint: SCRAPE_HINT },
      { text: "JS rendering & proxies included", hint: INCLUDED_HINT },
      "100,000 Answers in Fast mode",
      { text: "10,000 monitors", hint: MONITOR_HINT },
      "20 concurrent batches",
      "SSO / SAML",
      "Priority + Slack support",
      "Custom usage alerts",
      { text: "Pull 10M logos", hint: LOGO_HINT },
    ],
    cta: "Start Scale",
  },
  {
    name: "Enterprise",
    description: "For teams with custom volume, security, and compliance requirements.",
    features: [
      "Custom rate and monitor limits",
      "SSO, SAML and SCIM provisioning",
      "99.9% uptime SLA",
      "Annual invoicing, MSA and DPA",
      "Dedicated Slack channel",
      "Custom support and implementation help",
    ],
    cta: "Book demo",
  },
];

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

// Each plan's best-value range: where its overage stops being cheaper than the next plan up (the branch's
// lib/pricing-breakevens.ts, rounded to 50K pages).
const planFit = [
  { name: "Developer", range: "up to 50K pages", price: "$19" },
  { name: "Pro", range: "50K–250K pages", price: "$99" },
  { name: "Growth", range: "250K–650K pages", price: "$299" },
  { name: "Scale", range: "650K–2M pages", price: "$499" },
  { name: "Enterprise", range: "beyond 2M pages", price: "Custom" },
];

const DOCS = "https://docs.context.dev";
const creditCosts = [
  { title: "Scrape", href: `${DOCS}/scrape`, cost: "From 1 credit per call" },
  { title: "Scrape with JSON extraction", href: `${DOCS}/scrape/json`, cost: "5 credits per page" },
  { title: "Crawl", href: `${DOCS}/crawl`, cost: "1 credit per page" },
  { title: "Search", href: `${DOCS}/search`, cost: "From 1 credit per 10 results" },
  { title: "Answers", href: `${DOCS}/answers`, cost: "From 10 credits per call" },
  { title: "Brand", href: `${DOCS}/brand`, cost: "10 credits per call" },
  { title: "Styleguide", href: `${DOCS}/styleguide`, cost: "10 credits per call" },
  { title: "Parse", href: `${DOCS}/parse`, cost: "From 1 credit per call" },
];

export function Site() {
  const [billing, setBilling] = React.useState<BillingPeriod>("monthly");

  const cards = plans.map((plan) => {
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
        quota={
          custom
            ? ["2M+ credits per month", "Volume discounts"]
            : [`${plan.credits!.toLocaleString("en-US")} credits per month`, plan.overage!, { text: plan.concurrency!.replace(/ requests?$/, ""), label: plan.concurrency }]
        }
        features={plan.features}
      />
    );
  });

  return (<SiteSection>
    <div className="flex w-full flex-col gap-16">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-center pt-6">
          <PricingToggle value={billing} onValueChange={setBilling} />
        </div>
        <h2 className="sr-only">Plans</h2>
        <PricingShelves
          first={cards.slice(0, 4)}
          second={cards.slice(4)}
          panel={<PricingPlanFit rows={planFit} footnote="Ranges assume overage enabled, billed in 1,000-credit blocks. 1 credit per scrape at the base rate." />}
        />
        <PricingBanner
          className="mt-10"
          action={
            <Button asChild variant="pill-outline" className="gap-2 py-2.5">
              <a href="https://context.dev/startups">
                Apply for the discount
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          }
        >
          Eligible startups and nonprofits get 30% off an annual paid plan for 12 months.
        </PricingBanner>
      </div>
      <div className="flex flex-col">
        <SectionHeading title="One balance." accent="Every API." description="A standard scrape uses 1 credit. Here’s what each API costs." />
        <SectionHeaderRule />
        <CreditCostsTable rows={creditCosts} />
      </div>
    </div>
  </SiteSection>);
}
