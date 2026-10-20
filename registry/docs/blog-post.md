---
name: blog-post
title: Blog post
type: site
surface: site
description: "Article layout with a title, author, dates, body content, and related posts."
kinds: []
use_for: Blog posts and guides. Pass the dot field (HeroDotField) as `background`, the article as BlogProse children or `html`, and code samples as BlogCodeBlock inside it (light, with a "copy" pill, as the site's posts draw them). Follow the post with RelatedArticles (three BlogCards, white and blue in turn, in a ruled section; RelatedPosts and RelatedPostCard are deprecated), then ClosingCta.
never: [Bold headings in an article, Gray or dark article backgrounds, The dark CodeWindow for samples inside an article (use BlogCodeBlock), Line numbers in an article's code, A second column beside the article]
files: [components/site/blog-post.tsx, components/site/blog-code-block.tsx]
source: src/app/(marketing)/blog/[slug]/page.tsx; src/components/blog/BlogProseArticle.tsx; src/components/blog/BlogCodeBlock.tsx; src/components/blog/related-posts.tsx; src/components/blog-card.tsx; src/components/blog-author.tsx; src/lib/code-syntax-theme.ts; src/styles/globals.css (.brand-system .prose)
---
