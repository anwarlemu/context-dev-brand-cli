import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export function Product() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Banner title="Monitors are here" actions={<Button size="sm" asChild><a href="https://docs.context.dev/monitors" target="_blank" rel="noreferrer">Read more</a></Button>}>
        Watch any page and get told the moment it changes.
      </Banner>
      <Banner tone="alert" title="You've used 92% of your credits" actions={<Button variant="brand" size="sm" asChild><a href="/preview/settings-page/Billing">Upgrade</a></Button>}>
        Requests stop when you run out. Credits reset on the 1st.
      </Banner>
    </div>
  );
}
