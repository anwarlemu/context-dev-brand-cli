import { CustomerStoryPage } from "@/components/site/customer-story-page";

export function Site() {
  return (
    <CustomerStoryPage title="Mastra personalizes onboarding" accent="with Context.dev" date="September 12, 2026" dateTime="2026-09-12">
      <div className="flex flex-col gap-5 text-body-lg leading-relaxed text-fg-secondary">
        <p>Mastra built an onboarding MVP in an hour, pre-filling names and company details from a work email and tailoring the first screen to each user's goals.</p>
        <p>Before, new users typed the same details into four fields. Now the form fills itself, and the team ships changes to it in an afternoon.</p>
      </div>
    </CustomerStoryPage>
  );
}
