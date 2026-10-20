import { CapabilityPanel, DemoRow, MarkGlyph, ParamRow, ProductDemoCard, StatusChip } from "@/components/site/product-demo-card";

// The Brand search page's hero demo (a partial name in, matching companies out) and its three capability panels:
// autocomplete as someone types, one result's details, and the matching options.

/** The site's search icon (Hugeicons Search 01, drawn at a 1.5 stroke). */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M17 17L21 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export type BrandMatch = { name: string; domain: string };

const QUERY = "lin";

const MATCHES: BrandMatch[] = [
  { name: "Linear", domain: "linear.app" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Linktree", domain: "linktr.ee" },
];

const SEARCH_RESPONSE = `{
  "results": [
    {
      "name": "Linear",
      "domain": "linear.app",
      "logo": "https://logos.context.dev/...",
      "language": "english"
    },
    { "name": "LinkedIn", "domain": "linkedin.com", "logo": "..." },
    { "name": "Linktree", "domain": "linktr.ee", "logo": "..." }
  ]
}`;

/** The matches, each name's typed part in brand blue. */
function MatchList({ query, matches }: { query: string; matches: BrandMatch[] }) {
  return (
    <ul className="flex flex-col">
      {matches.map((match) => (
        <li key={match.domain} className="flex items-center gap-3.5 border-t border-hairline px-4 py-3 first:border-0">
          <MarkGlyph>{match.name[0]}</MarkGlyph>
          <span className="flex min-w-0 flex-col">
            <span className="text-demo-row leading-5 text-fg">
              <span className="text-brand">{match.name.slice(0, query.length)}</span>
              {match.name.slice(query.length)}
            </span>
            <span className="text-demo-code leading-demo-label text-black/50">{match.domain}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BrandSearchHeroDemo({ query = QUERY, matches = MATCHES, output = SEARCH_RESPONSE }: { query?: string; matches?: BrandMatch[]; output?: string }) {
  return (
    <ProductDemoCard
      label="Illustrative company autocomplete"
      inputLabel="Search query"
      input={
        <>
          <DemoRow
            glyph={
              <MarkGlyph>
                <SearchIcon className="size-4" />
              </MarkGlyph>
            }
            title={query}
            detail="Company name or domain"
            status={<StatusChip>{matches.length} matches</StatusChip>}
          />
          <MatchList query={query} matches={matches} />
        </>
      }
      outputLabel="JSON response"
      filename="results.json"
      output={output}
    />
  );
}

export function BrandSearchAutocompletePanel({ query = QUERY, matches = MATCHES }: { query?: string; matches?: BrandMatch[] }) {
  return (
    <CapabilityPanel label="Illustrative autocomplete results">
      <div className="flex items-center gap-2.5 rounded-card border border-black/10 px-3.5 py-2.5">
        <SearchIcon className="size-4 shrink-0 text-brand" />
        <p className="text-demo-row leading-5 text-fg">
          {query}
          <span aria-hidden="true" className="ml-px inline-block h-4 w-px translate-y-0.5 bg-brand" />
        </p>
      </div>
      <MatchList query={query} matches={matches} />
    </CapabilityPanel>
  );
}

const LINEAR_DETAILS = [
  { label: "Logo", value: "logos.context.dev" },
  { label: "Country", value: "US" },
  { label: "Language", value: "english" },
];

export function BrandSearchResultPanel() {
  return (
    <CapabilityPanel label="Illustrative search result">
      <div className="flex items-center gap-3.5">
        <MarkGlyph>L</MarkGlyph>
        <span className="flex min-w-0 flex-col">
          <span className="text-demo-title leading-demo-title text-fg">Linear</span>
          <span className="text-demo-code leading-demo-label text-black/50">linear.app</span>
        </span>
      </div>
      <dl className="flex flex-col">
        {LINEAR_DETAILS.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between gap-3 border-t border-hairline py-2.5 text-demo-label leading-5">
            <dt className="text-black/50">{detail.label}</dt>
            <dd className="truncate text-fg">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </CapabilityPanel>
  );
}

export function BrandSearchMatchingPanel() {
  return (
    <CapabilityPanel label="Example matching options">
      <ParamRow name="queryBy" value="name, domain" />
      <ParamRow name="country" value="US" />
      <ParamRow name="language" value="english" />
      <ParamRow name="typoTolerance" value="2" />
    </CapabilityPanel>
  );
}
