import { Plus } from "lucide-react";

import { EmptyState, EmptyStateRow } from "@/components/product/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlyphTile } from "@/components/visuals/glyph/glyph-tile";

export function Product() {
  return (
    <EmptyState
      glyph={<GlyphTile name="apiKeys" className="size-16 p-2" />}
      title="No API keys yet"
      description="Use these keys to authenticate requests to the API. Keep them secret."
      actions={
        <Button variant="brand" size="sm">
          <Plus className="size-3.5" strokeWidth={1.75} />
          Create API key
        </Button>
      }
    />
  );
}

export function FirstVisit() {
  return (
    <EmptyState
      glyph={<GlyphTile name="monitors" ringed className="size-28" />}
      title="Watch a page or sitemap"
      description="Create your first monitor to watch a page or sitemap for exact changes, or a whole site for changes that matter."
      actions={
        <>
          <Button variant="brand" size="sm">
            <Plus className="size-3.5" strokeWidth={1.75} />
            Create monitor
          </Button>
          <Button variant="outline" size="sm">
            Read docs
          </Button>
        </>
      }
      footer={<span className="text-caption text-fg-subtle">0 of 5 monitors used</span>}
    />
  );
}

export function InTable() {
  return (
    <div className="w-full max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Monitor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last run</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <EmptyStateRow colSpan={3}>No monitors match your search or filters.</EmptyStateRow>
        </TableBody>
      </Table>
    </div>
  );
}
