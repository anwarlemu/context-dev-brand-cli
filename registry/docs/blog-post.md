---
name: blog-post
title: Blog post
type: site
surface: site
description: A post in the ruled column. The title with its closing words in blue, a subtitle and the author and dates over a dot field, a header rule, then the article in a reading column with the site's prose (regular headings, muted body at 1.7, blue check bullets, a soft blue quote bar, images and tables as ringed white cards), and related posts as blue cards.
kinds: []
use_for: Blog posts, guides and the long comparison articles on compare pages. Pass the dot field (HeroDotField) as `background`, the article as BlogProse children or `html`, and code samples as CodeWindow inside it. Close the page with ClosingCta.
never: [Bold headings in an article, Gray or dark article backgrounds, Light code blocks for samples (use CodeWindow), A second column beside the article]
source: src/app/(marketing)/blog/[slug]/page.tsx; src/components/blog/BlogProseArticle.tsx; src/components/blog/BlogCodeBlock.tsx; src/components/blog/related-posts.tsx; src/components/blog-author.tsx; src/components/sections/alternatives/alternative-article.tsx; src/styles/globals.css (.brand-system .prose)
---
