import { SiteSection } from "@/components/site/section";
import { StatBlock, StatBlocks } from "@/components/site/stat-block";

export function Site() {
  return (<SiteSection>
    <StatBlocks className="w-full max-w-3xl">
      <StatBlock value="< 1 day" label="for SiteGPT to move its website crawling off Firecrawl" />
      <StatBlock value="1 API" label="replaced Hyperspell’s waterfall of fallback crawlers" />
    </StatBlocks>
  </SiteSection>);
}
