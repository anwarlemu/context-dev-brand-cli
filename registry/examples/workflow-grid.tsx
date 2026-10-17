import { DotGlyph } from "@/components/ui/dot-glyph";
import { WorkflowGrid } from "@/components/site/workflow-grid";

// Stand-ins for the workflows' dot stories, which come later.
const GLYPH = ["2.2.2", ".1.1.", "2.2.2", ".1.1.", "2.2.2"];
const media = <DotGlyph rows={GLYPH} className="size-20 text-brand" />;

export function Site() {
  return (
    <WorkflowGrid
      className="w-full"
      items={[
        { title: "Scrape anything", description: "Turn webpages and PDFs into Markdown, HTML, structured fields, images, and screenshots in one request.", media },
        { title: "Ground RAG in fresh content", description: "Collect pages with Scrape and Crawl, add documents with Parse, and keep your retrieval index current with Monitors.", media },
        { title: "Run deep research on demand", description: "Resolve a domain to a typed brand profile, then research the company in your JSON shape, with sources.", media },
        { title: "Run batches at scale", description: "Scrape thousands of URLs or crawl entire sites in one job, then collect results when it completes.", media },
        { title: "Enrich any entity your agent sees", description: "Connect company references and person identifiers to brand profiles and people data.", media },
        { title: "Autofill onboarding forms", description: "Pre-fill company fields from a work email domain so more users finish signing up.", media },
      ]}
    />
  );
}
