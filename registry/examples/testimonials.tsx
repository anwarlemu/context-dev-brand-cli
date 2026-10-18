import { Testimonials, type Testimonial } from "@/components/site/testimonials";

// The six the home page shows, in its order.
const items: Testimonial[] = [
  {
    id: 23,
    quote: "Onboarding couldn't be simpler. Self-serve sign-up gives you an API key immediately, the documentation is thorough, and we were integrating within 10 minutes.",
    highlights: ["we were integrating within 10 minutes"],
    name: "Nick Khami",
    role: "Engineering Manager @ Mintlify",
    href: "https://context.dev/blog/mintlify-turns-github-repos-into-branded-docs-sites-with-brand-dev",
  },
  {
    id: 1,
    quote: "As soon as you type in the email, we use Context.dev to collect information about your brand and different logos. Context.dev saves us a lot of time right now.",
    highlights: ["Context.dev saves us a lot of time right now"],
    name: "John Acosta",
    role: "Founder @ UsePropane.ai",
    href: "https://context.dev/blog/propane-ai-streamlines-onboarding-and-delivers-branded-user-interview-experiences-with-brand-dev",
  },
  {
    id: 16,
    quote: "Getting started is very simple. API docs are great and sign-up is self serve, with an API key generated immediately. Took 10 minutes to start integrating.",
    highlights: ["Getting started is very simple"],
    name: "Luke Ramsden",
    role: "CPTO @ Architect (tryarchitect.com)",
    href: "https://context.dev/blog/architect-enhances-product-onboarding-and-sales-gtm-with-brand-dev",
  },
  {
    id: 18,
    quote: "We're seeing much higher activation rates for our free trials and sign-ups because of it. It's made it a lot simpler for customers to get started with DocsBot and to get to that 'aha' value moment very quickly.",
    highlights: ["much higher activation rates", "'aha' value moment"],
    name: "Aaron Edwards",
    role: "Founder @ DocsBot",
    href: "https://context.dev/blog/docsbot-reduces-onboarding-friction-and-boosts-activation-with-brand-dev",
  },
  {
    id: 39,
    quote: "The API integration was seamless and expedient. My team was able to get it set up and testing with production workloads within an hour of hearing what Context.dev was!",
    highlights: ["testing with production workloads within an hour"],
    name: "Christopher Price",
    role: "COO @ Sixtyfour",
    href: "https://context.dev/customers/sixtyfour-tests-production-scraping-workloads-within-an-hour-with-context-dev",
  },
  {
    id: 21,
    quote: "Context.dev offers extensive documentation making the setup super easy. On top of this, there is a dedicated Slack channel in case you have follow-up questions. Overall the API integration process was very smooth.",
    highlights: ["extensive documentation", "dedicated Slack channel"],
    name: "Vlad Veselukha",
    role: "Senior Data Engineer @ Vizzy",
    href: "https://context.dev/blog/vizzy-beautifies-profiles-and-job-boards-with-brand-dev",
  },
];

export function Site() {
  return (
    <div className="flex w-full flex-col gap-10">
      <div className="text-center">
        <h2 className="text-h2 leading-tight tracking-tight text-fg">
          <span className="text-fg-brand">Success</span> stories
        </h2>
        <p className="mx-auto mt-4 max-w-md text-body leading-relaxed text-fg-muted">Feedback from the engineers shipping with us every day.</p>
      </div>
      <Testimonials items={items} />
    </div>
  );
}
