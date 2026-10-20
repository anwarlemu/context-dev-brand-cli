import { SiteSection } from "@/components/site/section";
import { TrustMark, TrustStrip } from "@/components/site/trust-strip";

const TRUST_CENTER = "https://trust.context.dev/";

export function Site() {
  return (<SiteSection>
    <TrustStrip
      className="w-full"
      items={[
        { mark: <TrustMark mark="compliance" />, label: "SOC 2 Type 2", description: "Review our compliance status and request access to security information through the trust center.", linkLabel: "View compliance", href: TRUST_CENTER },
        { mark: <TrustMark mark="policies" />, label: "Security policies", description: "Review the policies covering data handling, access control, and incident response.", linkLabel: "Review policies", href: TRUST_CENTER },
        { mark: <TrustMark mark="zdr" />, label: "Zero data retention", description: "Keep inputs and outputs out of our logs, caches, and storage. We only record that a request was made.", linkLabel: "How ZDR works", href: "/zero-data-retention" },
      ]}
    />
  </SiteSection>);
}
