"use client";

import { NewsletterSection } from "@/components/site/newsletter-section";

export function Site() {
  return (
    <NewsletterSection
      title="Product updates,"
      accent="once a month."
      description="New endpoints, changelog highlights and guides from the Acme team. No spam, unsubscribe any time."
      onSubmit={() => new Promise((resolve) => setTimeout(resolve, 800))}
      privacy={
        <>
          By subscribing you agree to our <a href="#privacy">privacy policy</a>.
        </>
      }
    />
  );
}
