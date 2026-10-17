import { FaqSection, type FaqCategory } from "@/components/site/faq";
import { Button } from "@/components/ui/button";

// The quick-view questions from the site's FAQ data, by category.
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
        answer: "Core API limits cap concurrent requests per organization: Free allows 1; Developer 10, Pro 100, Growth 250, and Scale 500. Enterprise can have custom limits; Logo Link has a separate quota.",
      },
      {
        question: "Why am I getting timeout errors?",
        answer: "Scrape waits up to 90 seconds by default. For slow or heavily protected pages, raise timeoutOpts.milliseconds (up to 300,000), set timeoutOpts.behavior to return-partial to keep the outputs that finished, and give your HTTP client a longer timeout than the request.",
      },
      { question: "What SDKs are available?", answer: "We provide official SDKs for TypeScript, Python, Ruby, Go, and PHP." },
      { question: "Do you support subdomains?", answer: "Yes, subdomains are fully supported." },
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
        question: "Which plan should I choose?",
        answer: "Start with Free for testing or Developer for your first workflow. Pro suits steady production usage; Growth adds capacity between Pro and Scale. Scale supports high-volume traffic and self-serve SSO / SAML. Choose Enterprise for custom volume, limits, procurement, or support.",
      },
      { question: "Do you offer annual billing?", answer: "Yes. Annual billing saves two months compared with monthly billing on every paid plan." },
      {
        question: "Do you offer discounts for startups or nonprofits?",
        answer: "Eligible startups and nonprofits can apply for 30% off an annual paid plan for 12 months, plus private Slack Connect with our team. Existing customer deals stay unchanged.",
      },
    ],
  },
  {
    value: "credits",
    label: "Credits & billing",
    items: [
      {
        question: "How do API credits work?",
        answer: "Scrape starts at 1 credit, or 2 with browser actions. Structured JSON extraction against your schema adds 4 when it succeeds, so 5 credits per page. Brand and Styleguide cost 10 credits. Web and news search cost 1 credit per 10 results.",
      },
      {
        question: "Are there extra fees for JS rendering, anti-bot bypass, or premium proxies?",
        answer: "JS rendering, anti-bot bypass, and proxies are included in the base scrape price. Browser actions raise the base to 2 credits. Successful JSON extraction adds 4 credits.",
      },
      {
        question: "Am I billed for failed requests?",
        answer: "Most failed requests are not billed. Not-found responses (404) are billed at the request’s base price. Check key_metadata.credits_consumed for the amount charged.",
      },
      {
        question: "What happens when my API credits run out?",
        answer: "The Free plan includes 1,000 API credits that renew every month. Paid plans can use Auto-Topup in 1K-credit blocks. With insufficient credits and no available top-up, any plan returns 401 USAGE_EXCEEDED.",
      },
    ],
  },
];

export function Site() {
  return (
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
  );
}
