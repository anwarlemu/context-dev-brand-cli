import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rows = [
  { name: "Production", created: "Oct 2, 2026", requests: "48,210", status: "Active" },
  { name: "Staging", created: "Sep 14, 2026", requests: "1,302", status: "Active" },
  { name: "Old key", created: "Mar 3, 2026", requests: "0", status: "Revoked" },
];

export function Product() {
  return (
    <div className="w-full max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Requests</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell className="text-fg-muted">{r.created}</TableCell>
              <TableCell className="text-right">{r.requests}</TableCell>
              <TableCell>
                <Badge variant={r.status === "Active" ? "success" : "default"}>{r.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
