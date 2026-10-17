---
name: blog-post
title: Blog post
type: site
surface: site
description: "Article layout with a title, author, dates, body content, and related posts."
kinds: []
use_for: Blog posts, guides and the long comparison articles on compare pages. Pass the dot field (HeroDotField) as `background`, the article as BlogProse children or `html`, and code samples as CodeWindow inside it. Close the page with ClosingCta.
never: [Bold headings in an article, Gray or dark article backgrounds, Light code blocks for samples (use CodeWindow), A second column beside the article]
source: src/app/(marketing)/blog/[slug]/page.tsx; src/components/blog/BlogProseArticle.tsx; src/components/blog/BlogCodeBlock.tsx; src/components/blog/related-posts.tsx; src/components/blog-author.tsx; src/components/sections/alternatives/alternative-article.tsx; src/styles/globals.css (.brand-system .prose)
---
