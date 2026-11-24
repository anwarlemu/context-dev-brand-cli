---
name: login-page
title: Login page
type: site
surface: site
description: "Two step sign in page: email with provider buttons, then password with a reset link, on the auth shell."
kinds: [page, card-ring, input, button-primary, link]
use_for: The site's sign in page. Inputs are controlled (`email`, `password` and their change handlers) and `step` is the app's ("email", then "password" once it knows the account signs in with one). `onSubmit` receives the trimmed email, the password and the step once the step's field is filled; the page shows "Enter your email address." or "Enter your password." through Field itself. Show the app's errors (a wrong password) with `errors`, cleared in the change handlers. `providers` are the round buttons on the email step, each with its own `onClick`; `pending` spins the button. `logo` with `title` makes the brand mark heading; `notice` and `emailLocked` serve an invitation. No auth runs in the page.
never: [Both steps' fields at once, Toasts for empty fields, Provider buttons on the password step, Third-party logos in examples]
source: src/app/(auth)/login/page.tsx; src/app/(auth)/login/LoginClient.tsx; src/app/(auth)/login/LoginFormPanel.tsx; src/app/(auth)/login/login-types.ts
---

Ported from the website's sign in (production pin 2f4c4559). The live page has since added a "Trouble signing in?"
line and a reCAPTCHA note; pass extra lines through `legal` if you need them. The site's Google and GitHub marks are
the app's to pass as provider icons.
