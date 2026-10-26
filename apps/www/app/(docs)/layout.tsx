import { LibraryShell } from "@www/components/sidebar";
import { BRAND_SITE, GROUPS, items, registryName, REPO } from "@www/lib/registry";

// Every docs page in one shell, so the sidebar keeps its scroll and filter between them. Example previews render bare.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const groups = GROUPS.map((g) => ({ id: g.id, type: g.type, label: g.label, items: items.filter((i) => i.type === g.type).map((i) => ({ name: i.name, title: i.title })).sort((a, b) => a.title.localeCompare(b.title)) })).filter((g) => g.items.length);
  return <LibraryShell groups={groups} name={registryName} repo={REPO} site={BRAND_SITE}>{children}</LibraryShell>;
}
