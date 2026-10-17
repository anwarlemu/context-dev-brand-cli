import { Clock, Globe, Map as MapIcon } from "lucide-react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { BeforeAfterPanel, BeforeAfterPanels, BeforeAfterStats, UseCaseComparisonTable, UseCaseFeatureCards, UseCaseNote } from "@/components/site/use-case-features";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { PageMonitorStory, SitemapMonitorStory } from "@/components/visuals/stories/monitor-ways-story";
import { WatchStory } from "@/components/visuals/stories/watch-story";

const SCRAPE_GLYPH = ["0222220", "2111112", "2122212", "2111112", "2122212", "2111112", "0222220"];

export function Site() {
  return (
    <div className="flex w-full flex-col">
      <SiteSection lines>
        <SectionHeading title="Watch the pages" accent="that matter." description="Point a monitor at a page, a section or a whole site, and get the change, not the whole page, at your webhook." />
        <SectionHeaderRule />
        <UseCaseFeatureCards
          // One to a row, each story beside its text, so the stories have room in this frame.
          layout="rows"
          items={[
            { title: "Pages", description: "Track one URL for any change to its text, prices or links.", icon: <Globe />, meta: "target: page", tags: ["Exact", "Semantic"], href: "/products/monitor", story: <PageMonitorStory /> },
            { title: "Sitemaps", description: "Watch a whole site and hear about every page that is added or removed.", icon: <MapIcon />, meta: "target: sitemap", badge: "New", story: <SitemapMonitorStory /> },
            { title: "Schedules", description: "Check every few minutes or once a day, and get a webhook when something moves.", icon: <Clock />, meta: "schedule: 6 hours", story: <WatchStory /> },
          ]}
        />
        <UseCaseNote glyph={<DotGlyph rows={SCRAPE_GLYPH} className="size-9 rounded-control bg-brand p-1.5 text-white" />}>
          Every monitor runs on the same scrape API, so the change you get is clean Markdown you can diff or send to a model.
        </UseCaseNote>
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="One API instead of" accent="a scraping stack." />
        <SectionHeaderRule />
        <UseCaseComparisonTable
          label="Context.dev compared with a scraping stack"
          columns={[
            { key: "diy", header: "Build it yourself", caption: "headless browsers and proxies" },
            { key: "context", header: "Context.dev", caption: "one API key", highlight: true },
          ]}
          rows={[
            { feature: "JavaScript pages", diy: "Run and scale your own browsers", context: "Rendered for you" },
            { feature: "Blocking", diy: "Rotate proxies and solve challenges", context: "Handled, with retries" },
            { feature: "Output", diy: "Raw HTML to clean up", context: "Markdown, HTML, JSON or screenshots" },
          ]}
        />
        <BeforeAfterPanels className="mt-10">
          <BeforeAfterPanel tone="before" title="A week of glue code">
            <p className="text-body text-fg-secondary">Browsers, proxies and parsers to keep alive, and a queue for the pages that failed.</p>
          </BeforeAfterPanel>
          <BeforeAfterPanel tone="after" title="One request">
            <p className="text-body text-fg-secondary">Send a URL, get the page as Markdown with its links and images.</p>
          </BeforeAfterPanel>
        </BeforeAfterPanels>
        <BeforeAfterStats
          accentIndex={2}
          stats={[
            { label: "Setup", value: "5 min" },
            { label: "Pages a minute", value: "1,000+" },
            { label: "Infrastructure to run", value: "None" },
          ]}
        />
      </SiteSection>
    </div>
  );
}
