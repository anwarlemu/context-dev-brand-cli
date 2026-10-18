import { CodeBlock, CodeWindow, WindowCopyButton } from "@/components/site/code-window";
import { BlogAuthor, BlogPost, BlogProse, RelatedPosts } from "@/components/site/blog-post";

const CODE = `const page = await client.web.scrape({ url: 'https://linear.app' });`;
const AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="#E9EFFD"/></svg>')}`;

export function Site() {
  return (
    <div className="w-full">
      <BlogPost
        title="Introducing Monitors:"
        accent="watch the web for changes"
        subtitle="Get notified when pricing, content, or pages change, with the diff sent to your webhook."
        author={<BlogAuthor name="Yahia Bakour" handle="mynameisyahia" image={AVATAR} href="https://context.dev/authors/yahia-bakour" />}
        published={{ iso: "2026-09-02", label: "September 2, 2026" }}
        updated={{ iso: "2026-09-20", label: "September 20, 2026" }}
      >
        <BlogProse>
          <p>
            Monitors watch any page on a schedule and tell you when it changes. Point one at a <a href="https://context.dev/pricing">pricing page</a> and get the change as soon as it lands.
          </p>
          <h2>What you can watch</h2>
          <ul>
            <li>Pricing and plan changes on competitor sites</li>
            <li>New pages on a docs site or a changelog</li>
            <li>Any field you extract with <code>formats.json</code></li>
          </ul>
          <blockquote>
            <p>We replaced a cron job and three scrapers with one monitor.</p>
          </blockquote>
          <CodeWindow label="TypeScript" actions={<WindowCopyButton value={CODE} />} className="my-6">
            <div className="overflow-x-auto">
              <CodeBlock code={CODE} />
            </div>
          </CodeWindow>
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Monitors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pro</td>
                <td>100</td>
              </tr>
              <tr>
                <td>Scale</td>
                <td>1,000</td>
              </tr>
            </tbody>
          </table>
        </BlogProse>
      </BlogPost>
      <RelatedPosts
        posts={[
          { title: "Introducing the Answers API", summary: "Web research, structured answers, one API call.", href: "https://context.dev/blog/introducing-answers-api", date: { iso: "2026-08-12", label: "August 12, 2026" } },
          { title: "Our free tier is back", summary: "1,000 free API credits every month.", href: "https://context.dev/blog/our-free-tier-is-back", date: { iso: "2026-07-01", label: "July 1, 2026" } },
        ]}
      />
    </div>
  );
}
