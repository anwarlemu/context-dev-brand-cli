import { LegalPage } from "@/components/site/legal-page";

export function Site() {
  return (
    <LegalPage title="Privacy policy" lastUpdated="October 1, 2026" backHref="#home" backLabel="Back to home">
      <p>This placeholder policy shows how a legal page is laid out. Acme Inc. (&quot;Acme,&quot; &quot;we&quot;) explains here what it collects and why.</p>
      <section>
        <h2>Summary</h2>
        <ul>
          <li>We collect account details and how you use the service.</li>
          <li>We never sell your personal information.</li>
          <li>You can ask us to export or delete your data at any time.</li>
        </ul>
      </section>
      <section>
        <h2>1. Information we collect</h2>
        <h3>Information you give us</h3>
        <p>
          <strong>In short:</strong> the details you enter when you sign up or contact us.
        </p>
        <p>This includes your name, email address, and anything you write to us.</p>
        <h3>Information collected automatically</h3>
        <p>Like most services, we log basic device and usage information to keep the service secure and reliable.</p>
      </section>
      <section>
        <h2>2. How we use information</h2>
        <p>We use it to provide and improve the service, to answer you, and to meet our legal obligations.</p>
      </section>
      <section>
        <h2>3. Contact us</h2>
        <p>
          Questions about this policy? Write to <a href="mailto:privacy@acme.dev">privacy@acme.dev</a>.
        </p>
      </section>
    </LegalPage>
  );
}
