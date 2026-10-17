import { Bot, LineChart } from "lucide-react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { UseCasePersonas } from "@/components/site/use-case-personas";

export function Site() {
  return (
    <SiteSection lines>
      <SectionHeading title="Who this" accent="is for." />
      <SectionHeaderRule />
      <UseCasePersonas
        items={[
          {
            type: "AI product teams",
            role: "Engineers shipping agents",
            icon: <Bot />,
            challenge: "Agents guess when they cannot read the page in front of them.",
            solution: "Scrape and search return clean, sourced page content in one call.",
            impact: "Answers grounded in the live web, with links to check them.",
          },
          {
            type: "Growth teams",
            role: "Marketers and analysts",
            icon: <LineChart />,
            challenge: "Competitor pages change and nobody notices for weeks.",
            solution: "Monitors watch the pages and send the change to a webhook.",
            impact: "Pricing and launch changes land in Slack the hour they happen.",
          },
        ]}
      />
    </SiteSection>
  );
}
