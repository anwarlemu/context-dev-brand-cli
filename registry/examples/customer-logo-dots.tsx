import { CustomerLogoDots } from "@/components/visuals/customer-logo-dots";

// A logo as a data URI, so the example samples without a network request or CORS.
const LOGO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 80V20h18l24 36V20h18v60H62L38 44v36z"/></svg>')}`;

export function Site() {
  return (
    <a href="/customers/acme" className="group flex w-full max-w-sm flex-col overflow-hidden rounded-card bg-brand text-on-brand outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
      <div className="relative h-60">
        <CustomerLogoDots src={LOGO} className="absolute inset-0 size-full" />
      </div>
      <div className="flex flex-col gap-1 p-6">
        <span className="text-h5">Acme</span>
        <span className="text-body-sm text-on-brand/80">Branded docs for every customer, built on brand context.</span>
      </div>
    </a>
  );
}
