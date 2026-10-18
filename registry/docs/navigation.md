---
name: navigation
title: Navigation
type: lib
surface: product
description: "Navigation callback for the page blocks."
kinds: []
use_for: Connect a page block to your application router.
never: []
---

Blocks call `navigate(href)` for navigation actions. By default it loads that path. A client router can listen for
the cancelable `ds:navigate` event, call `event.preventDefault()`, then use `event.detail.href` with its own router.
