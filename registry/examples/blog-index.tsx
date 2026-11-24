"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { BlogIndex, type BlogIndexPost } from "@/components/site/blog-index";
import { ClosingCta, CtaTextLink } from "@/components/site/cta";
import { HeroAction } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroDotField } from "@/components/visuals/hero-dot-field";
import { HeroMonitor } from "@/components/visuals/hero-monitor";
import { BatchesStory } from "@/components/visuals/stories/batches-story";

const POSTS: BlogIndexPost[] = [
  { title: "Acme raises a seed round to build for agents", excerpt: "A note from the team on what comes next, and who is joining us.", date: "October 19, 2026", dateTime: "2026-10-19", href: "#seed", category: "company" },
  { title: "Introducing page monitors", excerpt: "Watch any page for changes and get a webhook the moment it moves.", date: "October 17, 2026", dateTime: "2026-10-17", href: "#monitors", category: "product" },
  { title: "How we cut parse times in half", excerpt: "Porting the HTML parser to Rust, and what we measured along the way.", date: "September 28, 2026", dateTime: "2026-09-28", href: "#parser", category: "engineering" },
  { title: "Our free tier is back", excerpt: "Start building with 1,000 free credits every month, no card required.", date: "September 6, 2026", dateTime: "2026-09-06", href: "#free-tier", category: "product" },
  { title: "Retries that never double charge", excerpt: "Idempotency keys across the whole API, and the bugs they caught.", date: "August 19, 2026", dateTime: "2026-08-19", href: "#retries", category: "engineering" },
  { title: "Acme is now SOC 2 Type 1 compliant", excerpt: "What the audit covered and how to request the report.", date: "May 18, 2026", dateTime: "2026-05-18", href: "#soc2", category: "company" },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "product", label: "Product" },
  { value: "engineering", label: "Engineering" },
  { value: "company", label: "Company" },
];

export function Site() {
  const [category, setCategory] = React.useState("all");
  return (
    <BlogIndex
      title="The Acme Blog"
      accent="Blog"
      description="Product announcements, research, and engineering from Acme."
      heroBackground={<HeroDotField fine lively streams />}
      actions={
        <HeroAction>
          <Button asChild variant="pill">
            <a href="#signup">Start for free</a>
          </Button>
        </HeroAction>
      }
      media={
        <div className="mx-auto w-full max-w-md">
          <HeroMonitor>
            <BatchesStory />
          </HeroMonitor>
        </div>
      }
      heading="Latest from"
      headingAccent="the team."
      headingDescription="Product news, research, and engineering notes. Browse guides or the full archive for everything else."
      categories={CATEGORIES}
      category={category}
      onCategoryChange={setCategory}
      categoriesLabel="Filter blog posts by category"
      posts={POSTS}
      links={[
        { label: "Guides", href: "#guides" },
        { label: "Browse all articles", href: "#archive" },
        { label: "Customer stories", href: "#customers" },
      ]}
      cta={
        <ClosingCta
          title="Start building with live web context."
          description="Scrape, search, and research the web with one API. Bring the results straight into your product."
          figure={<span className="font-data text-h1 tabular-nums">1,000</span>}
          figureLabel="free credits"
          note="Every month. No credit card required."
          primaryAction={
            <Button asChild variant="pill-outline">
              <a href="#signup">Start for free</a>
            </Button>
          }
          secondaryAction={
            <CtaTextLink href="#docs">
              Read the docs <ArrowRight aria-hidden="true" />
            </CtaTextLink>
          }
        />
      }
    />
  );
}
