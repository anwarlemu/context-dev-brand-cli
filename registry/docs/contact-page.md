---
name: contact-page
title: Contact page
type: site
surface: site
description: "Contact page with a heading, address, response time, and help link cards, and a validated contact form with a sent state."
kinds: [section, section-heading, card-ring, input, button-primary]
use_for: The site's contact page, the first section under the header. Copy comes through props (`title` and its blue `accent`, `email`, the response time and `helpLinks`); `onSubmit` receives the name, email, company, message and the hidden honeypot `website` once the name, a valid email and the message are filled, and shows the confirmation when it resolves or the thrown error's message when it rejects. `lockedEmail` fills and locks the email for a signed-in account. Field draws each error under its input.
never: [Asterisks on the labels (the note under the form says what is required), A second column of form fields beyond name and email, An arrow that moves when a help link is hovered, Toasts for validation errors]
source: src/app/(marketing)/contact/page.tsx; src/app/(marketing)/contact/ContactForm.tsx; src/components/sections/shared/brand-outline-pill.ts
---

Clicking the address copies it: the copy icon cross-fades to a check in place (opacity and a slight scale, 200ms
ease-out) and the hint under it says so for two seconds. Nothing on the page moves on hover; links and the address only
change color.
