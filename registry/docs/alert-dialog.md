---
name: alert-dialog
title: Alert Dialog
type: ui
surface: both
description: "A confirmation in the dashboard's framed dialog: a title, a muted line, and Cancel beside the blue or red action over a light line."
use_for: "Ask before something that cannot be undone or costs money: revoking a key, deleting a monitor, changing a plan. Say what happens in the title (Revoke this key?) and the consequence in the description; name the action with its verb (Revoke key), never Yes or OK. Use variant destructive on the action when it removes something. Use size sm for a short yes-or-no with an icon in AlertDialogMedia."
never: [A close glyph (the person answers it), Yes and No as the action labels, More than two actions, A long form inside (use Dialog)]
source: "context-dashboard c0ddf7a src/components/ui/dialog.tsx (frame, title and footer); src/components/settings/settings-page.tsx (the danger zone)"
---
