import { SiteSection } from "@/components/site/section";
import { FaqList, FaqPlainList, FaqSection, type FaqCategory } from "@/components/site/faq";
import { Button } from "@/components/ui/button";

// The quick-view questions from the site's FAQ data (src/components/sections/faq-data.ts), by category.
const categories: FaqCategory[] = [
  {
    value: "api",
    label: "API & integration",
    items: [
      {
        question: "Can I crawl an entire website?",
        answer: "Yes. Crawl discovers and scrapes up to 500 pages into Markdown in one call, with controls for depth, page count, URL patterns, and subdomains. For larger sites, run Batches in crawl mode and collect results through pagination or a completion webhook. Use Map when you only need the URLs.",
      },
      {
        question: "What are the rate limits, and how can I increase them?",
        answer: "Core API limits cap concurrent requests per organization: Free allows 2; Developer 10, Pro 100, Growth 250, and Scale 500. New Free accounts also allow 10 requests per minute across their API keys. Paid plans have no per-minute cap by default. Existing accounts keep their current allowances until they change plans; custom overrides can apply to either limit or both. The dashboard shows your effective limits. Batches, Monitors, webhook deliveries, logs, and feedback have separate organization limits. Enterprise can have custom limits; Logo Link has a separate quota.",
      },
      {
        question: "Why am I getting timeout errors?",
        answer: "Scrape waits up to 90 seconds by default. For slow or heavily protected pages, raise timeoutOpts.milliseconds (up to 300,000), set timeoutOpts.behavior to return-partial to keep the outputs that finished, and give your HTTP client a longer timeout than the request. Use Batches for large URL lists, and Prefetch to warm uncached domains before a Brand request.",
      },
      {
        question: "What SDKs are available?",
        answer: "We provide official SDKs for TypeScript, Python, Ruby, Go, and PHP.",
      },
      {
        question: "How can my agent sign up?",
        answer: (
          <>
            AI agents can register and obtain API credentials programmatically using our agent authentication guide (auth.md). You will still need to sign in or verify your email. Share the link with your agent:{" "}
            <a href="https://www.context.dev/auth.md" className="text-fg-brand underline underline-offset-2">
              https://www.context.dev/auth.md
            </a>
          </>
        ),
      },
      {
        question: "How fresh is the brand data? How often is it updated?",
        answer: "Brand Retrieve may reuse cached data up to its documented maxAgeMs, which defaults to about 90 days and is clamped to 0 through one year. A value of 0 requests a fresh Brand retrieval. For a specific correction or rebrand, use https://www.context.dev/update and treat returned media URLs as external resources that your application should handle defensively.",
      },
      {
        question: "Do you support subdomains?",
        answer: "Yes, subdomains are fully supported.",
      },
      {
        question: "What if I need additional data points?",
        answer: "We are constantly adding new data points to the API and have more data under the hood that we don't surface yet. If you need a specific data point, please contact us at hello@context.dev and we will be happy to surface it.",
      },
    ],
  },
  {
    value: "pricing",
    label: "Pricing & plans",
    items: [
      {
        question: "Is there a free tier?",
        answer: "Yes. The free tier includes 1,000 API credits per month, enough for 1,000 standard scrapes, plus 10K one-time Logo Link requests, with no credit card required.",
      },
      {
        question: "What pricing plans are available, and can I make one-time lookups instead of subscribing?",
        answer: "Context.dev offers Developer ($19/mo), Pro ($99/mo), Growth ($299/mo), and Scale ($499/mo), plus Enterprise for teams that need more than 2M credits a month, volume discounts, or security and procurement support. We currently do not support one-time lookups, however you can contact us to discuss options for one-time projects at hello@context.dev.",
      },
      {
        question: "Which plan should I choose?",
        answer: "Start with Free for testing or Developer for your first workflow. Pro suits steady production usage; Growth adds capacity between Pro and Scale. Scale supports high-volume traffic and self-serve SSO / SAML. Choose Enterprise for custom volume, limits, procurement, or support. Upgrades apply immediately; downgrades apply at renewal.",
      },
      {
        question: "Do you offer annual billing?",
        answer: "Yes. Annual billing saves two months compared with monthly billing on every paid plan.",
      },
      {
        question: "Do you offer discounts for startups or nonprofits?",
        answer: "Eligible startups and nonprofits can apply for 30% off an annual paid plan for 12 months, plus private Slack Connect with our team. Existing customer deals stay unchanged. Apply at https://www.context.dev/startups.",
      },
      {
        question: "When should I talk to sales?",
        answer: "Talk to sales if you need high-volume pricing beyond 2M credits/month, custom rate limits, annual invoicing, or help with a security or procurement review. Review our published compliance status, policies, controls, and subprocessors at https://trust.context.dev/. Reach us at hello@context.dev or through the contact page.",
      },
    ],
  },
  {
    value: "credits",
    label: "Credits & billing",
    items: [
      {
        question: "How do API credits work?",
        answer: "Scrape starts at 1 credit, or 2 with browser actions. Structured JSON extraction against your schema adds 4 when it succeeds, so 5 credits per page. Highlights and Product add 1, and PDF OCR adds 1 per recovered page. Brand and Styleguide cost 10 credits. Answers costs 10 in Fast mode or 100 in Ultra. Web and news search cost 1 credit per 10 results; People costs 20 per match. Logo Link has a separate quota.",
      },
      {
        question: "Are there extra fees for JS rendering, anti-bot bypass, or premium proxies?",
        answer: "JS rendering, anti-bot bypass, and proxies are included in the base scrape price. Browser actions raise the base to 2 credits. Successful JSON extraction adds 4 credits. Highlights and Product add 1, and PDF OCR adds 1 per recovered page.",
      },
      {
        question: "Am I billed for failed requests?",
        answer: "Most failed requests are not billed. Not-found responses (404) are billed at the request’s base price. Check key_metadata.credits_consumed for the amount charged.",
      },
      {
        question: "What happens when my API credits run out?",
        answer: "The Free plan includes 1,000 API credits that renew every month. Paid plans can use Auto-Topup in 1K-credit blocks: Developer $2.20, Pro $1.80, Growth $1.40, and Scale $1.00 for new subscriptions. Existing subscriptions keep their rates. With insufficient credits and no available top-up, any plan returns 401 USAGE_EXCEEDED. Logo Link has a separate quota.",
      },
      {
        question: "What's the difference between API credits and Logo Link?",
        answer: "They are separate products with separate quotas. API credits meter the documented API endpoints. Logo Link returns a square logo through a direct image URL and does not consume API credits. Core API requests use the plan concurrency limit; Logo Link image delivery follows its separately documented quota and delivery policy.",
      },
    ],
  },
];

export function Site() {
  return (<SiteSection>
    <FaqSection
      className="w-full"
      categories={categories}
      description="Everything you need to know about integrating and scaling with Context.dev."
      action={
        <Button asChild variant="pill-outline">
          <a href="https://cal.com/context-dev/30min">Book demo</a>
        </Button>
      }
    />
  </SiteSection>);
}

// The scrolling list: fixed at its closed height, an opened answer scrolls inside it and the edges fade where more
// cards continue, so nothing below the list moves.
export function Scrolling() {
  return <FaqList className="w-full max-w-(--ds-layout-heading)" sizing="closed" items={[...categories[0].items, ...categories[1].items]} toggle="dots" />;
}

// A product page's FAQ: hairline rows in one ringed card, the first answer open.
export function Plain() {
  return <FaqPlainList className="w-full" items={categories[2].items} />;
}
