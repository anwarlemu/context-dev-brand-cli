import { BlogCoverMorph } from '@/components/ds/ui/blog-cover-morph';
import { RingBackdrop } from '@/components/ds/ui/ring-backdrop';
type Post = { slug: string; title: string };

/**
 * Dot-art covers for the homepage blog cards, rendered by scripts/generate-blog-cover-dots.mjs with
 * the Context Dot Shader pipeline (filled and hollow dots on a uniform grid). Each file is a
 * single-colour mask, so the same art serves the white card in blue and the blue card in white.
 * The motif is picked from the post's slug/title.
 */

export type BlogCoverMotif = 'blocked' | 'trends' | 'pages' | 'integration' | 'images' | 'extract';

export type BlogCardSurface = 'paper' | 'blue';

// Paper and Blue palettes from the Context Dot Shader.
export const BLOG_CARD_PALETTES: Record<BlogCardSurface, { background: string; dots: string }> = {
	paper: { background: '#FFFFFF', dots: '#2563EB' },
	blue: { background: '#2563EB', dots: '#FFFFFF' },
};

/** Alternates white and blue, so the three-column grid reads as a checkerboard. */
export function blogCardSurface(index: number): BlogCardSurface {
	return index % 2 === 0 ? 'paper' : 'blue';
}

const MOTIF_KEYWORDS: [BlogCoverMotif, RegExp][] = [
	['blocked', /error|40[0-9]|429|50[0-9]|520|block|anti-detect|captcha|proxy|proxies|detect|rate-limit/],
	['integration', /mcp|cursor|claude|set-up|setup|integrat|pipeline|sdk|webhook/],
	['images', /image|logo|screenshot|photo|favicon|visual/],
	['extract', /extract|pydantic|schema|structured|json|product-data|parse/],
	['pages', /javascript|render|browser|crawl|sitemap|page|markdown/],
	['trends', /trend|agentic|future|state-of|announc|introducing|best-/],
];

const FALLBACK_ORDER: BlogCoverMotif[] = ['pages', 'trends', 'integration', 'blocked', 'extract', 'images'];

export function getBlogCoverMotif(post: Pick<Post, 'slug' | 'title'>): BlogCoverMotif {
	const haystack = `${post.slug} ${post.title}`.toLowerCase();
	for (const [motif, pattern] of MOTIF_KEYWORDS) {
		if (pattern.test(haystack)) return motif;
	}
	let hash = 0;
	for (const char of post.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return FALLBACK_ORDER[hash % FALLBACK_ORDER.length];
}

/** Assign motifs to a list so neighbouring cards never repeat the same artwork. */
export function assignBlogCoverMotifs(posts: Pick<Post, 'slug' | 'title'>[]): BlogCoverMotif[] {
	const used = new Set<BlogCoverMotif>();
	return posts.map((post) => {
		let motif = getBlogCoverMotif(post);
		if (used.has(motif) && used.size < FALLBACK_ORDER.length) {
			motif = FALLBACK_ORDER.find((candidate) => !used.has(candidate)) ?? motif;
		}
		used.add(motif);
		if (used.size === FALLBACK_ORDER.length) used.clear();
		return motif;
	});
}

const BACKDROP_PITCH = 14;
export const BACKDROP_RING_OPACITY: Record<BlogCardSurface, number> = { paper: 0.14, blue: 0.22 };

// A faint ring tile behind the art. `space` repeats only whole tiles, so no ring is ever cut at the card's edge.
export function backdropTile(surface: BlogCardSurface) {
	const colour = encodeURIComponent(BLOG_CARD_PALETTES[surface].dots);
	const ring = `<svg xmlns='http://www.w3.org/2000/svg' width='${BACKDROP_PITCH}' height='${BACKDROP_PITCH}'><circle cx='${BACKDROP_PITCH / 2}' cy='${BACKDROP_PITCH / 2}' r='3.5' fill='none' stroke='${colour}' stroke-opacity='${BACKDROP_RING_OPACITY[surface]}' stroke-width='1'/></svg>`;
	return `url("data:image/svg+xml,${ring.replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}

// Three layers: the ring backdrop, then the card colour painted through the art's halo (each dot grown into a blob)
// to clear the backdrop around the art, then the art itself. Halo and art share one mask box, so they line up.
export function BlogCoverArt({ motif, surface }: { motif: BlogCoverMotif; surface: BlogCardSurface }) {
	const palette = BLOG_CARD_PALETTES[surface];
	const artMask = `url(/blog-covers/${motif}.svg) center / contain no-repeat`;
	const haloMask = `url(/blog-covers/${motif}-halo.svg) center / contain no-repeat`;
	return (
		<div aria-hidden="true" className="relative h-full w-full">
			{/* Drawn ring by ring so none is sliced by the card's rounded corners. */}
			<RingBackdrop color={palette.dots} opacity={BACKDROP_RING_OPACITY[surface]} className="inset-0" />
			<BlogCoverMorph motif={motif} dotColor={palette.dots} backgroundColor={palette.background}>
				<div className="absolute inset-0" style={{ backgroundColor: palette.background, mask: haloMask, WebkitMask: haloMask }} />
				<div className="absolute inset-0" style={{ backgroundColor: palette.dots, mask: artMask, WebkitMask: artMask }} />
			</BlogCoverMorph>
		</div>
	);
}
