import { LogoStrip, type StripLogo } from "@/components/site/logo-strip";

// The site's order. Zero's mark is wide and short, so it is drawn `compact`.
const names = ["Super", "Passionfroot", "Zero", "mintlify", "chatwoot", "similarweb", "Klarna.", "Ferndesk", "DocsBot", "daily.dev", "Sixtyfour", "Comp AI", "Squad"];

// Logos with a quote show it in a card that glides between them on hover; the rest only take their color.
const quotes: Partial<Record<string, StripLogo["quote"]>> = {
  mintlify: {
    quote: "Onboarding couldn't be simpler. Self-serve sign-up gives you an API key immediately, the documentation is thorough, and we were integrating within 10 minutes.",
    name: "Nick Khami",
    role: "Engineering Manager @ Mintlify",
    href: "https://context.dev/blog/mintlify-turns-github-repos-into-branded-docs-sites-with-brand-dev",
  },
  Super: {
    quote: "Context.dev gave us company data for every signup on day one, so the product feels tailored before anyone touches a setting.",
    name: "Hayden Barnes",
    role: "Founding Engineer @ Super",
  },
};

export function Site() {
  return (
    <LogoStrip
      label={
        <>
          Powering agents and products with <span className="text-fg-brand">the world&apos;s data.</span>
        </>
      }
      logos={names.map((name) => ({ name, quote: quotes[name], compact: name === "Zero", node: <span className="text-h5 font-medium whitespace-nowrap text-fg">{name}</span> }))}
    />
  );
}
