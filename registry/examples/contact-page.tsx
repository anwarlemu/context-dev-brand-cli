"use client";

import { ContactPage } from "@/components/site/contact-page";

export function Site() {
  return (
    <ContactPage
      title="Let's talk."
      accent="A real person will reply."
      description="Questions about the API, custom plans, or partnerships? Send us a message and the team will write back."
      email="hello@acme.dev"
      emailDescription="For sales, support, security disclosures, and general questions."
      responseTitle="Typical response time"
      responseDescription="Within one business day, often the same hour."
      helpTitle="Looking for something specific?"
      helpLinks={[
        { label: "Browse the FAQ", href: "#faq" },
        { label: "Read the API docs", href: "#docs" },
        { label: "Check service status", href: "#status" },
        { label: "Apply for the startup discount", href: "#startups" },
      ]}
      privacy={
        <>
          By sending this form you agree to our <a href="#privacy">privacy policy</a>. We only use your details to reply to your message.
        </>
      }
      onSubmit={() => new Promise((resolve) => setTimeout(resolve, 800))}
    />
  );
}
