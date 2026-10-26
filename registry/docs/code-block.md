---
name: code-block
title: Code Block
type: ui
surface: both
description: "Code to read and copy: the dashboard's light card with numbered, wrapped lines, or the site's dark code window."
use_for: "Use for a request, a response or a snippet someone will read or copy. In the product use the default look (a JSON response, a webhook payload, an SDK call); on the site use variant terminal. Give it a CodeBlockHeader with CodeBlockTitle (the file or language) and a CodeBlockCopyButton, then CodeBlockContent with the code and its language. For an interactive JSON response with folding and search use JsonViewer; for a sample in several languages on the site use CodeTabs."
never: [A dark block in the product, Syntax colors outside the code tokens, Sideways scrolling in the product]
source: "context-dashboard c0ddf7a src/components/playground/json-viewer.tsx; src/components/playground/code-card.tsx; website src/components/sections/shared/code-frame.tsx"
---
