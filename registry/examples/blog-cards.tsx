import { BlogCards, BlogSection, type BlogPost } from "@/components/site/blog-cards";

// Recent posts from the blog; the covers fall back to the ring-and-dots placeholder until the cover art is ported.
const posts: BlogPost[] = [
  {
    title: "Headless Scraping at Scale: Playwright, Browserless, Zyte, and Context.dev",
    excerpt: "Compare Playwright, Browserless, Zyte, and Context.dev for stateless scraping at scale, with guidance on rendering, queues, retries, and structured output.",
    date: "October 8, 2026",
    dateTime: "2026-10-08",
    tag: "Guide",
    href: "/blog/headless-scraping-at-scale",
  },
  {
    title: "Browser Fingerprinting Explained: Headless Browsers and Anti-Detect Profiles",
    excerpt: "Learn how browser fingerprinting exposes automation, what anti-detect profiles solve, and when a managed scraping API fits your workflow.",
    date: "September 27, 2026",
    dateTime: "2026-09-27",
    tag: "Deep dive",
    href: "/blog/browser-fingerprinting-explained",
  },
  {
    title: "How to Set Up Context.dev MCP in Cursor and Claude",
    excerpt: "Connect Context.dev to Cursor, Claude, and Claude Code with OAuth, then verify live web search, JavaScript-rendered Markdown, and structured extraction.",
    date: "September 21, 2026",
    dateTime: "2026-09-21",
    tag: "Deep dive",
    href: "/blog/how-to-set-up-context-dev-mcp-in-cursor-and-claude",
  },
];

export function Site() {
  return <BlogCards posts={posts} className="w-full" />;
}

export function Band() {
  return <BlogSection posts={posts} />;
}
