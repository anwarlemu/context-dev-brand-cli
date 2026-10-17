import { DataToolbar, DataToolbarActions, DataToolbarSearch } from "@/components/product/data-toolbar";
import { Button } from "@/components/ui/button";

export function Product() {
  return (
    <DataToolbar className="w-full max-w-2xl">
      <DataToolbarSearch placeholder="Search monitors" />
      <DataToolbarActions>
        <Button variant="outline">Export</Button>
      </DataToolbarActions>
    </DataToolbar>
  );
}
