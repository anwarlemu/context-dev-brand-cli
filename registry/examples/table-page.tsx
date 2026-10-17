import { TablePage } from "@/components/blocks/table-page";

export function Block() {
  return <TablePage />;
}

export function Paid() {
  return <TablePage plan="paid" />;
}

export function Empty() {
  return <TablePage keys={[]} />;
}
