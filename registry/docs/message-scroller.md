---
name: message-scroller
title: Message Scroller
type: ui
surface: both
description: "A conversation's scroll area that stays on the newest message and offers a Jump to latest pill when you scroll up."
use_for: "Wrap a conversation in MessageScroller with MessageScrollerViewport, MessageScrollerContent and one MessageScrollerItem per message, and add MessageScrollerButton for the jump pill. Set scrollAnchor on the message just sent so its reply grows below it. useMessageScroller, useMessageScrollerScrollable and useMessageScrollerVisibility read and drive it; MessageScrollerProvider lets a composer outside the scroll area reach it."
never: [Auto-scrolling while someone reads older messages, A jump button that slides]
source: "context-dashboard c0ddf7a src/components/shell/support-chat.tsx (its thread)"
---
