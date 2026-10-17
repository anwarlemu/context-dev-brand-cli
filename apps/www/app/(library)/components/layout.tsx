import { LibraryShell } from "@www/components/sidebar";
import { GROUPS, items, registryName, REPO } from "@www/lib/registry";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  const groups = GROUPS.map((g) => ({ id: g.id, type: g.type, label: g.label, items: items.filter((i) => i.type === g.type).map((i) => ({ name: i.name, title: i.title })) })).filter((g) => g.items.length);
  return <LibraryShell groups={groups} name={registryName} repo={REPO}>{children}</LibraryShell>;
}
