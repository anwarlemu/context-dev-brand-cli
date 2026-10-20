import { CapabilityPanel, DemoRow, MarkGlyph, ParamRow, ProductDemoCard, StatusChip } from "@/components/site/product-demo-card";
import { cn } from "@/lib/utils";

// The News page's hero demo (a company in, its newest coverage out) and its three capability panels: the ways to name
// a company, the coverage filters, and an article with its source.

/** The site's building icon (Hugeicons Building 02, drawn at a 1.5 stroke). */
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M15 2H9C5.69067 2 5 2.69067 5 6V22H19V6C19 2.69067 18.3093 2 15 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M3 22H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M15 22V19C15 17.3453 14.6547 17 13 17H11C9.34533 17 9 17.3453 9 19V22" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M13.5 6H10.5M13.5 9.5H10.5M13.5 13H10.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

export type NewsArticle = { type: string; title: string; source: string; date: string };

const ARTICLES: NewsArticle[] = [
  { type: "Editorial", title: "Example expands its developer platform", source: "Industry Journal", date: "Sep 18" },
  { type: "Press release", title: "New tools for teams building on the web", source: "Example Newsroom", date: "Sep 16" },
  { type: "Editorial", title: "What the latest release means for developers", source: "The Product Review", date: "Sep 14" },
];

const NEWS_RESPONSE = `{
  "data": [
    {
      "title": "${ARTICLES[0].title}",
      "url": "https://journal.example/4821",
      "type": "editorial",
      "published_at": "2026-09-18T14:00:00Z",
      "source": { "name": "${ARTICLES[0].source}" },
      "story_id": "st_7d41"
    }
  ],
  "has_more": true,
  "next_cursor": "c_9f2a"
}`;

export function NewsHeroDemo({ domain = "example.com", articles = ARTICLES, output = NEWS_RESPONSE }: { domain?: string; articles?: NewsArticle[]; output?: string }) {
  return (
    <ProductDemoCard
      label="Illustrative company coverage"
      inputLabel="Company"
      input={
        <>
          <DemoRow
            glyph={
              <MarkGlyph>
                <BuildingIcon className="size-4" />
              </MarkGlyph>
            }
            title={domain}
            detail="Domain"
            status={<StatusChip>Newest first</StatusChip>}
          />
          <ul className="flex flex-col">
            {articles.map((article) => (
              <li key={article.title} className="flex flex-col gap-1 border-t border-hairline px-1 py-3 first:border-0">
                <span className="flex items-center justify-between gap-4 text-demo-meta leading-4 text-black/50">
                  <span>{article.type}</span>
                  <span>{article.date}</span>
                </span>
                <span className="text-demo-row leading-5 text-fg">{article.title}</span>
                <span className="text-demo-meta leading-4 text-black/50">{article.source}</span>
              </li>
            ))}
          </ul>
        </>
      }
      outputLabel="JSON response"
      filename="news.json"
      output={output}
    />
  );
}

const ENTITY_TYPES = ["name", "domain", "ticker", "isin"];

export function NewsEntityPanel() {
  return (
    <CapabilityPanel label="The ways to identify a company">
      <p className="font-mono text-demo-code leading-5 text-black/60">searchBy.entity.type</p>
      <ul className="flex flex-wrap gap-2">
        {ENTITY_TYPES.map((type) => (
          <li key={type} className={cn("rounded-pill border border-brand px-3 py-1 font-mono text-demo-code leading-5 text-brand", type === "domain" && "bg-blue-10")}>
            {type}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 border-t border-hairline pt-3">
        <MarkGlyph className="size-8">
          <BuildingIcon className="size-4" />
        </MarkGlyph>
        <span className="flex min-w-0 flex-col">
          <span className="text-demo-label leading-5 text-fg">example.com</span>
          <span className="text-demo-meta leading-4 text-black/50">One company, one feed</span>
        </span>
      </div>
    </CapabilityPanel>
  );
}

const COVERAGE_OPTIONS = [
  {
    group: "filterBy",
    params: [
      { name: "articleType", value: "editorial" },
      { name: "sourceCountry", value: "us" },
      { name: "articleLanguage", value: "en" },
    ],
  },
  { group: "sortBy", params: [{ name: "type", value: "newest" }] },
];

export function NewsCoveragePanel() {
  return (
    <CapabilityPanel label="Example coverage filters">
      {COVERAGE_OPTIONS.map(({ group, params }) => (
        <div key={group} className="flex flex-col gap-2 border-t border-hairline pt-3 first:border-0 first:pt-0">
          <p className="font-mono text-demo-code leading-5 text-fg">{group}</p>
          <div className="flex flex-col gap-3 border-l border-black/10 pl-3">
            {params.map((param) => (
              <ParamRow key={param.name} name={param.name} value={param.value} />
            ))}
          </div>
        </div>
      ))}
    </CapabilityPanel>
  );
}

const SOURCE_FIELDS = [
  { label: "Publisher", value: ARTICLES[0].source },
  { label: "URL", value: "journal.example/4821" },
  { label: "Published", value: "Sep 18, 2026" },
  { label: "Story", value: "st_7d41" },
];

export function NewsSourcePanel() {
  return (
    <CapabilityPanel label="Illustrative article with its source">
      <p className="text-demo-row leading-5 text-fg">{ARTICLES[0].title}</p>
      <dl className="flex flex-col">
        {SOURCE_FIELDS.map((field) => (
          <div key={field.label} className="flex items-center justify-between gap-3 border-t border-hairline py-2.5 text-demo-label leading-5">
            <dt className="shrink-0 text-black/50">{field.label}</dt>
            <dd className="truncate text-fg">{field.value}</dd>
          </div>
        ))}
      </dl>
    </CapabilityPanel>
  );
}
