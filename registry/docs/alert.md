---
name: alert
title: Alert
type: ui
surface: both
description: "A notice in the flow of a page: card corners and a light edge, a line glyph, a medium title over muted text, an action at the end."
use_for: "Use for something the person should know where it applies: a key that will expire, a crawl that hit its limit, a change to the API. `info` (blue 10) for news, `warning` (soft amber) for something that needs attention soon, `destructive` (soft red) for what failed, `default` for a quiet note. Put a lucide glyph first, then AlertTitle and AlertDescription; put a button or a short note in AlertAction. For a notice across the top of a whole page, use Banner."
never: [Two alerts stacked for the same thing, A red alert for something that has not failed, Bold titles, An alert that moves or slides in]
source: "src/components/dashboard-ui/banner.tsx (the page banner; extrapolated for the default and warning tones)"
---
