"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type Monitor = { id: string; url: string; status: "live" | "paused" | "failing"; interval: string; changes: number; checked: Date };

const MONITORS: Monitor[] = [
  ["stripe.com/pricing", "live", "Hour", 3],
  ["linear.app/changelog", "live", "Day", 12],
  ["vercel.com/pricing", "paused", "Hour", 0],
  ["notion.so/product", "live", "15 minutes", 7],
  ["figma.com/pricing", "failing", "Hour", 1],
  ["github.com/pricing", "live", "Day", 2],
  ["slack.com/pricing", "live", "Hour", 4],
  ["openai.com/api/pricing", "live", "15 minutes", 9],
  ["anthropic.com/pricing", "paused", "Day", 0],
  ["supabase.com/pricing", "live", "Hour", 5],
  ["clerk.com/pricing", "live", "Day", 1],
  ["resend.com/pricing", "failing", "Hour", 0],
].map(([url, status, interval, changes], i) => ({ id: `mon_${i + 1}`, url: url as string, status: status as Monitor["status"], interval: interval as string, changes: changes as number, checked: new Date(Date.UTC(2026, 9, 24, 9, 60 - i * 4)) }));

const STATUS = { live: "success", paused: "default", failing: "destructive" } as const;

const COLUMNS: DataTableColumn<Monitor>[] = [
  { id: "url", header: "Page", accessor: (m) => m.url, sortable: true, hideable: false },
  { id: "status", header: "Status", accessor: (m) => m.status, sortable: true, cell: (m) => <Badge variant={STATUS[m.status]}>{m.status}</Badge> },
  { id: "interval", header: "Checks every", accessor: (m) => m.interval },
  { id: "changes", header: "Changes", accessor: (m) => m.changes, sortable: true, align: "end" },
  { id: "checked", header: "Last check", accessor: (m) => m.checked, sortable: true, cell: (m) => m.checked.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }) },
];

export function Site() {
  return (
    <div className="w-full max-w-3xl">
      <DataTable columns={COLUMNS} data={MONITORS} getRowId={(m) => m.id} filter={{ placeholder: "Filter pages" }} pageSize={5} rowName="monitor" />
    </div>
  );
}

export function Product() {
  const [rows, setRows] = React.useState(MONITORS);
  const [selection, setSelection] = React.useState<string[]>([]);
  return (
    <div className="w-full max-w-3xl">
      <DataTable
        columns={COLUMNS}
        data={rows}
        getRowId={(m) => m.id}
        filter={{ placeholder: "Filter monitors" }}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        pageSize={5}
        pageSizes={[5, 10, 20]}
        defaultSort={{ id: "changes", desc: true }}
        rowName="monitor"
        toolbar={
          selection.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-danger text-danger hover:border-danger hover:bg-danger/6"
              onClick={() => {
                setRows((r) => r.filter((m) => !selection.includes(m.id)));
                setSelection([]);
              }}
            >
              <Trash2 strokeWidth={1.5} />
              Delete {selection.length}
            </Button>
          )
        }
      />
    </div>
  );
}

export function Empty() {
  return (
    <div className="w-full max-w-3xl">
      <DataTable columns={COLUMNS} data={[]} getRowId={(m) => m.id} empty="No monitors yet. Add one to watch a page for changes." rowName="monitor" />
    </div>
  );
}
