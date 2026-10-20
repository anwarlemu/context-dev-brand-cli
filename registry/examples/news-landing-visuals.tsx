import { NewsCoveragePanel, NewsEntityPanel, NewsHeroDemo, NewsSourcePanel } from "@/components/site/news-landing-visuals";
import { ProductStorySection } from "@/components/site/product-landing";

export function Site() {
  return (
    <div className="mx-auto w-full max-w-[var(--ds-layout-column-wide)] px-6 py-12 sm:px-8 md:px-10 lg:px-12">
      <NewsHeroDemo />
    </div>
  );
}

export function Capabilities() {
  return (
    <div className="w-full">
      <ProductStorySection
        title="Pick a company."
        accent="Follow its coverage."
        description="Find articles about the business you follow, narrow them to the coverage you want, and keep every source attached."
        items={[
          { title: "Search around a company", description: "Identify the business by name, domain, ticker, or ISIN to find relevant coverage.", story: <NewsEntityPanel /> },
          { title: "Choose the coverage", description: "Filter by date, publisher, country, language, or article type. Sort by relevance or newest first.", story: <NewsCoveragePanel /> },
          { title: "Keep the source attached", description: "Use publisher details, article URLs, publication dates, and story IDs to build a feed your users can inspect.", story: <NewsSourcePanel /> },
        ]}
      />
    </div>
  );
}
