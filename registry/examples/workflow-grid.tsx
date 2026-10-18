import { SiteSection } from "@/components/site/section";
import { WorkflowGrid } from "@/components/site/workflow-grid";
import { AutofillStory } from "@/components/visuals/stories/autofill-story";
import { BatchStory } from "@/components/visuals/stories/batch-story";
import { EnrichStory } from "@/components/visuals/stories/enrich-story";
import { RagStory } from "@/components/visuals/stories/rag-story";
import { ResearchStory } from "@/components/visuals/stories/research-story";
import { ScrapeStory } from "@/components/visuals/stories/scrape-story";

// Each workflow with its own dot story in the panel, as on the home page.
export function Site() {
  return (<SiteSection>
    <WorkflowGrid
      className="w-full"
      items={[
        { title: "Scrape anything", description: "Turn webpages and PDFs into Markdown, HTML, structured fields, images, and screenshots in one request.", media: <ScrapeStory className="w-full" /> },
        { title: "Ground RAG in fresh content", description: "Collect pages with Scrape and Crawl, add documents with Parse, and keep your retrieval index current with Monitors.", media: <RagStory className="w-full" /> },
        { title: "Run deep research on demand", description: "Resolve a domain to a typed brand profile, then research the company in your JSON shape, with sources.", media: <ResearchStory className="w-full" /> },
        { title: "Run batches at scale", description: "Scrape thousands of URLs or crawl entire sites in one job, then collect results when it completes.", media: <BatchStory className="w-full" /> },
        { title: "Enrich any entity your agent sees", description: "Connect company references and person identifiers to brand profiles and people data.", media: <EnrichStory className="w-full" /> },
        { title: "Autofill onboarding forms", description: "Pre-fill company fields from a work email domain so more users finish signing up.", media: <AutofillStory className="w-full" /> },
      ]}
    />
  </SiteSection>);
}
