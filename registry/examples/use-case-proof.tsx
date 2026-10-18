import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { UseCaseCustomers, UseCaseExampleCards, UseCaseProof, UseCaseStoryCards } from "@/components/site/use-case-proof";

// Each customer's own mark goes in its chip.
const mark = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

export function Site() {
  return (
    <div className="flex w-full flex-col">
      <SiteSection lines>
        <SectionHeading title="Teams crawling the web with" accent="Context.dev." />
        <SectionHeaderRule />
        <UseCaseCustomers
          items={[
            { name: "Mintlify", logo: mark("mintlify.com") },
            { name: "Similarweb", logo: mark("similarweb.com") },
            { name: "Instant", logo: mark("instant.so") },
          ]}
        />
        <UseCaseProof
          quote={{
            quote: "We replaced our crawler, its proxies and its parsers with one API, and our agents got better context the same day.",
            name: "Raz",
            role: "AI Lead, Similarweb",
            story: { label: "Read the story", href: "https://context.dev/blog/similarweb-10x-ai-agents-with-context-dev" },
          }}
          metrics={[
            { value: "10x", label: "more data points for each agent" },
            { value: "< 1 day", label: "from first call to production" },
          ]}
        />
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="What teams" accent="built with it." description="Three crawls running in production today." />
        <SectionHeaderRule />
        <UseCaseExampleCards
          items={[
            { title: "Docs from a repo", description: "Every page of a product's site, crawled into a branded docs site.", href: "https://context.dev/customers/mintlify", credit: "Mintlify" },
            { title: "Store builder", description: "A shop's pages, crawled to seed an AI store builder with its brand.", href: "https://context.dev/customers/instant", credit: "Instant" },
            { title: "Agent research", description: "Company sites crawled on demand to answer an agent's questions.", href: "https://context.dev/customers/similarweb", credit: "Similarweb" },
          ]}
        />
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="Stories from" accent="the field." />
        <SectionHeaderRule />
        <UseCaseStoryCards
          items={[
            { customer: "Instant", title: "Switched from Firecrawl in under a day", metric: "< 1 day", metricLabel: "to production", href: "https://context.dev/blog/instant-switches-from-firecrawl-to-context-dev-in-under-a-day" },
            { customer: "Tinfoil", title: "Added scraping to a private search agent", metric: "5 min", metricLabel: "to integrate", href: "https://context.dev/blog/tinfoil-switches-to-context-dev-for-zero-data-retention-web-scraping" },
            { customer: "Mastra", title: "Personalized onboarding in an hour", metric: "1 hour", metricLabel: "to an MVP", href: "https://context.dev/blog/mastra-personalizes-onboarding-with-context-dev" },
          ]}
        />
      </SiteSection>
    </div>
  );
}
