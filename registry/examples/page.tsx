import { PageColumn, PageHeader, PageSection } from "@/components/product/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Product() {
  return (
    <PageColumn className="w-full">
      <PageHeader title="Monitors" description="Watch pages and get told when they change." action={<Button>New monitor</Button>} />
      <PageSection title="Active">
        <Card className="text-body-sm text-fg-muted">3 monitors checking on schedule.</Card>
      </PageSection>
    </PageColumn>
  );
}
