---
name: newsletter-section
title: Newsletter section
type: site
surface: site
description: "Newsletter band: a section heading beside a ringed card with an email field, a black pill, and a confirmation state."
kinds: [section, section-heading, card-ring, input, button-primary]
use_for: A newsletter or updates sign up near the foot of a page. `onSubmit` receives the trimmed address once it is valid (Field shows "Enter your email." or the invalid message under the input); resolve to swap in the confirmation, or throw an Error to show its message. `privacy` is the line under the form.
never: [More than one field, A popup or modal sign up, Toasts for validation errors]
derived_from: [section, contact-page, field, input, button]
---

Derived, not ported: the brand's site has no newsletter form. It is composed from library items only: a SiteSection
with SectionHeading, the contact page's ringed card, and Field, Input and the `pill` Button.
