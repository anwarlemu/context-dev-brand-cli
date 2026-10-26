---
name: input-otp
title: Input OTP
type: ui
surface: both
description: "A one-time code in joined 40px slots, the active slot in brand blue with a blinking caret."
use_for: "Enter a short verification code (six digits for sign-in or a sensitive change). Set maxLength, and pattern={REGEXP_ONLY_DIGITS} for numbers; onComplete fires when the code is full. Pasting a whole code and SMS autofill work. Say where the code was sent in the help line."
never: [Separate inputs per digit, Auto-submitting without showing the code, A code field without a resend action nearby]
source: "Extrapolated from the dashboard's field (context-dashboard c0ddf7a src/components/ui/form.tsx, INPUT_CLASS)"
---
