"use client";

import * as React from "react";
import { KeyRound, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { AppShell } from "@/components/blocks/app-shell";
import { DataToolbar, DataToolbarActions, DataToolbarSearch } from "@/components/product/data-toolbar";
import { EmptyState } from "@/components/product/empty-state";
import { PageColumn, PageHeader } from "@/components/product/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuHoldItem, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SecretField } from "@/components/ui/secret-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const KEYS = [
  { id: "1", name: "Production", key: "ctx_live_9f2c41b7e0a84d6c", created: "Oct 2, 2026", used: "2 min ago", status: "Active" },
  { id: "2", name: "Staging", key: "ctx_live_1b8d03e94c2a7f55", created: "Sep 14, 2026", used: "Yesterday", status: "Active" },
  { id: "3", name: "Old key", key: "ctx_live_77aa20cd5e1b9f03", created: "Mar 3, 2026", used: "Never", status: "Revoked" },
];

// A list page (API keys): the header with the main action, a toolbar to search and filter, the table with a row menu,
// and the empty state when nothing matches.
export function TablePage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const rows = KEYS.filter((k) => k.name.toLowerCase().includes(query.toLowerCase()) && (status === "all" || k.status.toLowerCase() === status));
  return (
    <AppShell active="API keys">
      <PageColumn>
        <PageHeader title="API keys" description="Keys work for every endpoint on your plan." action={<Button>Create key</Button>} />
        <DataToolbar>
          <DataToolbarSearch placeholder="Search keys" value={query} onChange={(e) => setQuery(e.target.value)} />
          <DataToolbarActions>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All keys</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </DataToolbarActions>
        </DataToolbar>
        {rows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>
                    <span className="block">{k.name}</span>
                    <span className="block text-caption text-fg-subtle">Created {k.created}</span>
                  </TableCell>
                  <TableCell className="w-64">
                    <SecretField secret={k.key} label={`${k.name} key`} />
                  </TableCell>
                  <TableCell className="text-fg-muted">{k.used}</TableCell>
                  <TableCell>
                    <Badge variant={k.status === "Active" ? "success" : "default"}>{k.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`${k.name} actions`}>
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Pencil strokeWidth={1.5} /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuHoldItem onConfirm={() => {}}>
                          <Trash2 strokeWidth={1.5} /> Revoke
                        </DropdownMenuHoldItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState icon={<KeyRound strokeWidth={1.25} />} title="No keys match" description="Try another name, or create a key for this project." action={<Button>Create key</Button>} />
        )}
      </PageColumn>
    </AppShell>
  );
}
