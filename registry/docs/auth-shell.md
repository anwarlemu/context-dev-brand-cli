---
name: auth-shell
title: Auth shell
type: site
surface: site
description: "Sign in frame: a white form card on a blue ring panel over ruler hairlines, a legal line, and a rotating customer quote from lg."
kinds: [page, card-ring, input, button-primary, link]
use_for: The frame of the sign in, sign up and reset password pages (LoginPage and SignupPage are built on it). Put an AuthCard with an AuthHeader in AuthPageShell; set `imageHeight` (px) so the panel fits the card, and `imageMinHeight` to let it shrink on short windows. Pass the privacy and terms links as `legal` and an AuthProofPanel as `aside`. Style inputs with `AUTH_INPUT` in a Field (label in AuthLabel), the submit with `variant="pill"` and `AUTH_SUBMIT`, links with `AUTH_LINK` or `AUTH_MUTED_LINK`, a blue note with `AUTH_NOTICE`. PasswordInput adds the show and hide button; AuthSocialButtons the round provider buttons with the "Last used" tag.
never: [The site header or footer around it, A second colored panel, Provider buttons with text labels, Icons that move on hover]
source: src/app/(auth)/AuthScaffold.tsx; src/app/(auth)/auth-styles.ts; src/app/(auth)/SocialAuthSection.tsx; src/app/(auth)/layout.tsx; src/components/ui/password-input.tsx; src/components/ui/visibility-icon.tsx; src/components/sections/shared/brand-outline-pill.ts
---

The proof panel's quote moves every ten seconds while the active avatar's ring fills (a linear progress, drawn with the
Web Animations API); picking an avatar restarts it, and under reduced motion the ring stays empty. The password eyes
cross-fade in place (opacity and a slight scale, 150ms ease-out); provider buttons and links change only color or fill
on hover. The site shows customer photos in the avatars; without an `avatar`, initials stand in.
