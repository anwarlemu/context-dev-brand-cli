import { SidebarAlertCard } from "@/components/product/sidebar-alert-card";

export function Product() {
  return (
    <div className="flex w-53 flex-col">
      <SidebarAlertCard tone="danger" tag="Last payment failed" message="Your payment method is failing." action="Fix issue" />
      <SidebarAlertCard tone="warning" tag="3 days left" message="Your plan ends on Oct 20." action="Resume plan" />
    </div>
  );
}
