import { BrandSearchAutocompletePanel, BrandSearchHeroDemo, BrandSearchMatchingPanel, BrandSearchResultPanel } from "@/components/site/brand-search-landing-visuals";
import { ProductStorySection } from "@/components/site/product-landing";

export function Site() {
  return (
    <div className="mx-auto w-full max-w-[var(--ds-layout-column-wide)] px-6 py-12 sm:px-8 md:px-10 lg:px-12">
      <BrandSearchHeroDemo />
    </div>
  );
}

export function Capabilities() {
  return (
    <div className="w-full">
      <ProductStorySection
        title="Search as they type."
        accent="Show the company they mean."
        description="Match a partial name or domain to recognizable brands, then tune the matching to your market."
        items={[
          { title: "Autocomplete company names", description: "Find matching brands as someone types. Prefix matching helps people select the company they mean.", story: <BrandSearchAutocompletePanel /> },
          { title: "Show a recognizable result", description: "Each match includes a name, domain, and logo URL, plus a description, country, and primary language when available.", story: <BrandSearchResultPanel /> },
          { title: "Control the matching", description: "Search names, domains, or both. Filter by country and primary language, choose whole-word matching, or allow up to two typos.", story: <BrandSearchMatchingPanel /> },
        ]}
      />
    </div>
  );
}
