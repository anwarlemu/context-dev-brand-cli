"use client";

import { useState } from "react";
import { ExampleNameDialog } from "./demo-feedback";
import { Plus } from "lucide-react";

import { EmptyState, EmptyStateRow } from "@/components/product/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlyphTile } from "@/components/visuals/glyph/glyph-tile";

export function Product() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState("");
  if (created) return <div className="grid gap-3"><p role="status">{created} created in this example.</p><Button variant="outline" onClick={() => setCreated("")}>Reset example</Button></div>;
  return (<>
    <EmptyState
      glyph={<GlyphTile name="apiKeys" className="size-16 p-2" />}
      title="No API keys yet"
      description="Use these keys to authenticate requests to the API. Keep them secret."
      actions={
        <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" strokeWidth={1.75} />
          Create API key
        </Button>
      }
    />
    <ExampleNameDialog title="Create API key" open={open} onOpenChange={setOpen} onSave={setCreated} submitLabel="Create" /></>
  );
}

export function FirstVisit() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState("");
  if (created) return <div className="grid gap-3"><p role="status">{created} created in this example.</p><Button variant="outline" onClick={() => setCreated("")}>Reset example</Button></div>;
  return (<>
    <EmptyState
      glyph={<GlyphTile name="monitors" ringed className="size-28" />}
      title="Watch a page or sitemap"
      description="Create your first monitor to watch a page or sitemap for exact changes, or a whole site for changes that matter."
      actions={
        <>
          <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Create monitor
          </Button>
          <Button variant="outline" size="sm" asChild><a href="https://docs.context.dev/monitors" target="_blank" rel="noreferrer">Read docs</a></Button>
        </>
      }
      footer={<span className="text-caption text-fg-subtle">0 of 5 monitors used</span>}
    />
    <ExampleNameDialog title="Create Monitor" open={open} onOpenChange={setOpen} onSave={setCreated} submitLabel="Create" /></>
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
