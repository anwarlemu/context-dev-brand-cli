import { JsonViewer } from "@/components/product/json-viewer";

const RESPONSE = {
  url: "https://acme.com/pricing",
  status: 200,
  title: "Pricing | Acme",
  plans: [
    { name: "Starter", price: 0, credits: 1000 },
    { name: "Pro", price: 49, credits: 100000 },
  ],
  fetchedAt: "2026-10-17T09:12:00Z",
  cached: false,
};

export function Product() {
  return (
    <div className="h-80 w-full max-w-xl rounded-card bg-surface shadow-card">
      <JsonViewer value={RESPONSE} className="h-full" />
    </div>
  );
}
