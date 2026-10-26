---
name: message
title: Message
type: ui
surface: both
description: "One message in a conversation: a round 28px avatar, the sender and time, its bubbles and a caption footer."
use_for: "Build a conversation from Message rows inside a MessageGroup: MessageAvatar (an initial or a picture), MessageContent with MessageHeader (the name, then a time element) and the Bubble pieces, and an optional MessageFooter (Delivered, Seen). Set align end for the person's own messages; the row mirrors."
never: [Square avatars, A bold sender name, Times darker than the subtle gray]
source: "context-dashboard c0ddf7a src/components/shell/support-chat.tsx; src/components/team/team-page.tsx (avatars)"
---
