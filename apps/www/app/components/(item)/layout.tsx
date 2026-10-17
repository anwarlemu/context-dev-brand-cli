import { SectionEdgeLines } from "@/components/site/section";
import { LibraryBar, LibraryNav } from "@www/components/sidebar";
import { GROUPS, items } from "@www/lib/registry";

// The item pages share this layout, so the sidebar stays mounted between them: it keeps its scroll and filter, and
// nothing moves when you pick another item. The content column is at least a screen tall, so the footer never rises
// beside the sidebar.
export default function ItemLayout({ children }: { children: React.ReactNode }) {
  const groups = GROUPS.map((g) => ({ label: g.label, items: items.filter((i) => i.type === g.type).map((i) => ({ name: i.name, title: i.title })) })).filter((g) => g.items.length);
  return (
    <div className="relative overflow-x-clip">
      <LibraryBar groups={groups} />
      <SectionEdgeLines header="under" />
      <div className="relative mx-auto flex w-full max-w-(--ds-frame-column) gap-10 px-6 sm:px-8 md:px-10 lg:px-12">
        <LibraryNav groups={groups} />
        <div className="min-h-[calc(100svh-var(--spacing)*18)] min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
