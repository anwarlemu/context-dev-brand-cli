import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";

export function Site() {
  return (
    <SiteSection lines>
      <SectionHeading
        title="Web infrastructure that powers agents"
        accent="at any scale."
        description="Scrape any page, map and crawl entire websites, run batches of thousands of URLs, get sourced answers, and monitor changes through one API."
      />
      <SectionHeaderRule />
      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="ring">
          <CardTitle className="text-h4">Search</CardTitle>
          <CardDescription className="text-body">Search the web or the news and get ranked results with clean page content, not just links.</CardDescription>
        </Card>
        <Card variant="ring">
          <CardTitle className="text-h4">Scrape</CardTitle>
          <CardDescription className="text-body">Turn any page or PDF into Markdown, HTML, structured fields, images, or screenshots in one request.</CardDescription>
        </Card>
      </div>
    </SiteSection>
  );
}
