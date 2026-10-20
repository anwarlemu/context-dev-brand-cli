import { PeopleContextPanel, PeopleEnrichmentHeroDemo, PeopleIdentifiersPanel, PeopleMatchPanel } from "@/components/site/people-enrichment-landing-visuals";
import { ProductStorySection } from "@/components/site/product-landing";

export function Site() {
  return (
    <div className="mx-auto w-full max-w-[var(--ds-layout-column-wide)] px-6 py-12 sm:px-8 md:px-10 lg:px-12">
      <PeopleEnrichmentHeroDemo />
    </div>
  );
}

export function Capabilities() {
  return (
    <div className="w-full">
      <ProductStorySection
        title="Start with an identifier."
        accent="Get context you can check."
        description="Send what you know about a person and get back the available profile details, with a match status and score to review."
        items={[
          { title: "Start with what you know", description: "Use an email or social profile URL, or combine a name with company, education, or location details.", story: <PeopleIdentifiersPanel /> },
          { title: "Keep the useful context", description: "Get available profile details such as a current role, work history, education, location, and social links.", story: <PeopleContextPanel /> },
          { title: "Inspect the match", description: "Use the returned candidate status and match score to decide how your application handles the profile.", story: <PeopleMatchPanel /> },
        ]}
      />
    </div>
  );
}
