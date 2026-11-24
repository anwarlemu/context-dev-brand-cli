---
name: signup-page
title: Signup page
type: site
surface: site
description: "Two step sign up page: a free plan note, email with provider buttons, then name and password, on the auth shell."
kinds: [page, card-ring, input, button-primary, link]
use_for: The site's sign up page. Inputs are controlled (`email`, `name`, `password`) and `step` is the app's ("email", then "credentials" once it has checked the address has no account). The button stays disabled until the step's fields are filled; `onSubmit` receives the trimmed values, and empty fields get their message through Field. Show the app's errors (an address already in use, a weak password) with `errors`. `notice` is the blue note on what the free plan includes, `footnote` the smaller line under the sign in link. No auth runs in the page.
never: [Asking for the name before the email, Toasts for empty fields, Provider buttons on the credentials step, Third-party logos in examples]
source: src/app/(auth)/signup/page.tsx; src/app/(auth)/signup/SignupClient.tsx; src/app/(auth)/signup/SignupFormPanel.tsx; src/app/(auth)/signup/signup-types.ts
---

Ported from the website's sign up (production pin 2f4c4559). The panel is taller than the sign in's (696px, shrinking
to 648px on short windows) and the quotes on the right are its own set.
