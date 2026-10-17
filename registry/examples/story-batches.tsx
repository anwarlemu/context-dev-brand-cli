import { BatchesStory } from "@/components/visuals/stories/batches-story";

export function Product() {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <BatchesStory className="w-72" />
      <h2 className="mt-8 text-h4">Scrape pages in bulk</h2>
      <p className="mt-1 max-w-120 text-body-sm text-balance text-fg-muted">
        Submit your first batch to scrape a list of URLs, or crawl a whole site, as one job you can check on later.
      </p>
    </div>
  );
}
