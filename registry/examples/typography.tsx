import { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable } from "@/components/ui/typography";

export function Site() {
  return (
    <article className="w-full max-w-2xl">
      <TypographyH1>Web data for agents</TypographyH1>
      <TypographyLead className="mt-4">Scrape, crawl, search and parse the web with one API key, and get back what a model can read.</TypographyLead>
      <TypographyH2 className="mt-10">How it works</TypographyH2>
      <TypographyP>
        Send a URL to <TypographyInlineCode>POST /v1/scrape</TypographyInlineCode> and get the page back as markdown, HTML or structured JSON. Pages are rendered in a real browser, so content behind scripts comes back too.
      </TypographyP>
      <TypographyBlockquote>We replaced three scrapers and a queue with one call.</TypographyBlockquote>
      <TypographyH3 className="mt-10">What you can build</TypographyH3>
      <TypographyList>
        <li>Agents that read the docs they are asked about</li>
        <li>Price and change monitors across thousands of pages</li>
        <li>Search grounded in fresh results</li>
      </TypographyList>
    </article>
  );
}

export function Product() {
  return (
    <article className="w-full max-w-xl">
      <TypographyH3>Changelog</TypographyH3>
      <TypographyMuted className="mt-1">What changed in the API this month.</TypographyMuted>
      <TypographyH4 className="mt-6">Parse returns tables as rows</TypographyH4>
      <TypographyP>
        Set <TypographyInlineCode>tables: "rows"</TypographyInlineCode> to get each table as an array of objects keyed by its header.
      </TypographyP>
      <TypographyTable>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Credits</th>
            <th>Rate limit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Starter</td>
            <td>10,000</td>
            <td>5 per second</td>
          </tr>
          <tr>
            <td>Growth</td>
            <td>250,000</td>
            <td>50 per second</td>
          </tr>
        </tbody>
      </TypographyTable>
      <TypographyLarge>Need more?</TypographyLarge>
      <TypographySmall className="mt-1 block text-fg-muted">Talk to us about volume pricing.</TypographySmall>
    </article>
  );
}

export function Lists() {
  return (
    <div className="w-full max-w-md">
      <TypographyList ordered>
        <li>Create an API key</li>
        <li>Call the endpoint from your server</li>
        <li>Watch usage in the dashboard</li>
      </TypographyList>
    </div>
  );
}
