import { PageColumn, PageHeader, PageRise, PageSection } from "@/components/product/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Product() {
  return (
    <PageColumn className="w-full">
      <PageHeader title="Monitors" description="Watch pages and get told when they change." action={<Button variant="brand" size="sm">New monitor</Button>} />
      <PageSection title="Active">
        <PageRise index={0}>
          <Card className="text-body-sm text-fg-muted">3 monitors checking on schedule.</Card>
        </PageRise>
      </PageSection>
    </PageColumn>
  );
}
