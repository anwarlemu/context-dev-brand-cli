import { TrustMark, TrustStrip } from "@/components/site/trust-strip";

const TRUST_CENTER = "https://trust.context.dev/";

export function Site() {
  return (
    <TrustStrip
      className="w-full"
      items={[
        { mark: <TrustMark mark="compliance" />, label: "SOC 2 Type 1 & Type 2", description: "Review our compliance status and request access to security information through the trust center.", linkLabel: "View compliance", href: TRUST_CENTER },
        { mark: <TrustMark mark="policies" />, label: "Security policies", description: "Review the policies covering data handling, access control, and incident response.", linkLabel: "Review policies", href: TRUST_CENTER },
        { mark: <TrustMark mark="controls" />, label: "Security controls", description: "Explore published controls for encryption at rest, security monitoring, and supplier security.", linkLabel: "Review controls", href: TRUST_CENTER },
      ]}
    />
  );
}
