---
name: verify-email-page
title: Verify email page
type: site
surface: site
description: "Email verification page: one card with the brand mark, a status glyph, title and a full width pill on the blue ring panel."
kinds: [page, card-ring, button-primary]
use_for: The page a verification link opens. `status="confirm"` asks the reader to press the button (nothing is verified on load, against link scanners) and calls `onConfirm`, spinning while `pending`; the app then sets "verified" or "error". Those two show `actionHref` as the button (the dashboard, or back to sign up); `autoProceed` with `onProceed` moves on from a verified page after 1.2 seconds. Each state has the site's copy, overridable with `title`, `description`, `footer` and `actionLabel`.
never: [Verifying on page load, A spinner without a label, The site header or footer around it]
source: src/app/(dashboard)/verify-email/page.tsx; src/app/(dashboard)/verify-email/VerifyEmailClient.tsx; src/app/(dashboard)/verify-email/VerifyEmailConfirmation.tsx; src/components/onboarding/OnboardingAuthStepScaffold.tsx; src/components/onboarding/OnboardingBrandStage.tsx; src/components/onboarding/onboarding-flow-styles.ts
---

Ported from the website's verify email route (production pin 2f4c4559), which sits on the onboarding stage. The live
page has since moved the logo to the window's corner and squared the button; this follows the pin.
