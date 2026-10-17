import { AppShell } from "@/components/blocks/app-shell";
import { PageColumn, PageHeader } from "@/components/product/page";

export function Block() {
  return (
    <div className="h-[40rem]">
      <AppShell active="Usage">
        <PageColumn>
          <PageHeader title="Usage" description="Your page goes here." />
        </PageColumn>
      </AppShell>
    </div>
  );
}

export function PaymentFailed() {
  return (
    <div className="h-180">
      <AppShell active="Overview" paymentFailed>
        <PageColumn>
          <PageHeader title="Overview" />
        </PageColumn>
      </AppShell>
    </div>
  );
}
