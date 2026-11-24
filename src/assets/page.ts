import { readFileSync } from 'node:fs';
import type { Outline, SectionInfo } from '../design/index.js';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

// Pages from the library's site sections, for `design page compose`: an outline (checked by the core) becomes a React
// page that imports the installed components (`add` them first), and a plain HTML page that needs nothing but the brand
// stylesheet. Only the outline's words go on the page; links default to "#".

export const SECTIONS: SectionInfo[] = [
	{ type: 'header', description: 'The site header: the logo, links and a button.', copy: [{ id: 'action' }, { id: 'action-href' }], items: { count: [0, 7], copy: [{ id: 'label', required: true }, { id: 'href' }] } },
	{ type: 'hero', description: 'The first section: title with one accent phrase, a line, and two buttons.', copy: [{ id: 'title', required: true }, { id: 'accent' }, { id: 'description' }, { id: 'primary' }, { id: 'primary-href' }, { id: 'secondary' }, { id: 'secondary-href' }, { id: 'note' }] },
	{ type: 'text', description: 'A section heading with a paragraph.', copy: [{ id: 'title', required: true }, { id: 'accent' }, { id: 'body' }] },
	{ type: 'features', description: 'Product cards in a grid: a name, a line, tags and a link.', copy: [{ id: 'title' }, { id: 'accent' }, { id: 'description' }], items: { count: [2, 8], copy: [{ id: 'name', required: true }, { id: 'description', required: true }, { id: 'tags' }, { id: 'href' }] } },
	{ type: 'stats', description: 'Big figures with a line each.', copy: [{ id: 'title' }], items: { count: [1, 4], copy: [{ id: 'value', required: true }, { id: 'label', required: true }] } },
	{ type: 'testimonials', description: 'Quotes with a name and role (use Acme, never a real person).', copy: [{ id: 'title' }, { id: 'accent' }], items: { count: [1, 6], copy: [{ id: 'quote', required: true }, { id: 'name', required: true }, { id: 'role', required: true }] } },
	{ type: 'faq', description: 'Questions and answers.', copy: [{ id: 'title' }, { id: 'description' }], items: { count: [1, 20], copy: [{ id: 'question', required: true }, { id: 'answer', required: true }] } },
	{ type: 'blog', description: 'Posts as cards.', copy: [{ id: 'title' }, { id: 'all-href' }], items: { count: [1, 9], copy: [{ id: 'title', required: true }, { id: 'excerpt' }, { id: 'date', required: true }, { id: 'tag' }, { id: 'href' }] } },
	{ type: 'cta', description: 'The closing call to action.', copy: [{ id: 'title', required: true }, { id: 'description' }, { id: 'figure' }, { id: 'figure-label' }, { id: 'note' }, { id: 'primary' }, { id: 'primary-href' }, { id: 'secondary' }, { id: 'secondary-href' }] },
	{ type: 'footer', description: 'The site footer: the logo, a line and links.', copy: [{ id: 'description' }, { id: 'copyright' }], items: { count: [0, 12], copy: [{ id: 'label', required: true }, { id: 'href' }] } },
];

type Section = Outline['sections'][number];
const js = (s: string) => JSON.stringify(s);
const jsx = (s: string) => `{${js(s)}}`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const href = (v?: string) => v?.trim() || '#';
const tags = (v?: string) => (v ? v.split('|').map((x) => x.trim()).filter(Boolean) : []);

/** The page as React: one file that imports the library's installed components. */
function react(o: Outline): Record<string, string> {
	const imports = new Map<string, Set<string>>();
	const use = (file: string, ...names: string[]) => {
		const set = imports.get(file) ?? new Set<string>();
		for (const n of names) set.add(n);
		imports.set(file, set);
	};
	const parts: string[] = [];
	const logo = `<span className="text-h5 leading-none">${jsx(brand().name)}</span>`;
	for (const s of o.sections) {
		const c = s.copy ?? {};
		const items = s.items ?? [];
		const heading = (title?: string, accent?: string, description?: string) => {
			if (!title) return '';
			use('@/components/site/section', 'SectionHeading');
			return `<SectionHeading title=${jsx(title)}${accent ? ` accent=${jsx(accent)}` : ''}${description ? ` description=${jsx(description)}` : ''} />`;
		};
		const button = (label: string | undefined, to: string | undefined, variant: string) => {
			if (!label) return '';
			use('@/components/ui/button', 'Button');
			return `<Button asChild variant="${variant}"><a href=${jsx(href(to))}>${jsx(label)}</a></Button>`;
		};
		switch (s.type) {
			case 'header':
				use('@/components/site/site-header', 'SiteHeader');
				parts.push(`<SiteHeader logo={${logo}} items={${JSON.stringify(items.map((i) => ({ label: i.label, href: href(i.href) })))}}${c.action ? ` primaryAction={{ label: ${js(c.action)}, href: ${js(href(c['action-href']))} }}` : ''} />`);
				break;
			case 'hero': {
				use('@/components/site/hero', 'Hero');
				const actions = [c.primary ? (c.note ? (use('@/components/site/hero', 'HeroAction'), `<HeroAction note=${jsx(c.note)}>${button(c.primary, c['primary-href'], 'pill')}</HeroAction>`) : button(c.primary, c['primary-href'], 'pill')) : '', button(c.secondary, c['secondary-href'], 'pill-outline')].filter(Boolean);
				parts.push(`<Hero title=${jsx(c.title!)}${c.accent ? ` accent=${jsx(c.accent)}` : ''}${c.description ? ` description=${jsx(c.description)}` : ''}${actions.length ? ` actions={<>${actions.join('')}</>}` : ''} />`);
				break;
			}
			case 'text':
				use('@/components/site/section', 'SiteSection');
				parts.push(`<SiteSection>${heading(c.title, c.accent)}${c.body ? `<p className="max-w-2xl text-body text-fg-muted">${jsx(c.body)}</p>` : ''}</SiteSection>`);
				break;
			case 'features':
				use('@/components/site/section', 'SiteSection');
				use('@/components/site/product-grid', 'ProductGrid');
				parts.push(`<SiteSection>${heading(c.title, c.accent, c.description)}<ProductGrid className="w-full" products={${JSON.stringify(items.map((i) => ({ name: i.name, description: i.description, tags: tags(i.tags), href: href(i.href) })))}} /></SiteSection>`);
				break;
			case 'stats':
				use('@/components/site/section', 'SiteSection');
				use('@/components/site/stat-block', 'StatBlock', 'StatBlocks');
				parts.push(`<SiteSection>${heading(c.title)}<StatBlocks className="w-full">${items.map((i) => `<StatBlock value=${jsx(i.value!)} label=${jsx(i.label!)} />`).join('')}</StatBlocks></SiteSection>`);
				break;
			case 'testimonials':
				use('@/components/site/section', 'SiteSection');
				use('@/components/site/testimonials', 'Testimonials');
				parts.push(`<SiteSection>${heading(c.title, c.accent)}<Testimonials items={${JSON.stringify(items.map((i, n) => ({ id: n + 1, quote: i.quote, name: i.name, role: i.role })))}} /></SiteSection>`);
				break;
			case 'faq':
				use('@/components/site/section', 'SiteSection');
				use('@/components/site/faq', 'FaqSection');
				parts.push(`<SiteSection><FaqSection${c.title ? ` title=${jsx(c.title)}` : ''}${c.description ? ` description=${jsx(c.description)}` : ''} categories={${JSON.stringify([{ value: 'all', label: 'All', items: items.map((i) => ({ question: i.question, answer: i.answer })) }])}} /></SiteSection>`);
				break;
			case 'blog':
				use('@/components/site/blog-cards', 'BlogSection');
				parts.push(`<BlogSection${c.title ? ` title=${jsx(c.title)}` : ''}${c['all-href'] ? ` allHref=${jsx(c['all-href'])}` : ''} posts={${JSON.stringify(items.map((i) => ({ title: i.title, ...(i.excerpt ? { excerpt: i.excerpt } : {}), date: i.date, ...(i.tag ? { tag: i.tag } : {}), href: href(i.href) })))}} />`);
				break;
			case 'cta':
				use('@/components/site/section', 'SiteSection');
				use('@/components/site/cta', 'ClosingCta');
				parts.push(`<SiteSection><ClosingCta title=${jsx(c.title!)}${c.description ? ` description=${jsx(c.description)}` : ''}${c.figure ? ` figure={<span className="font-data text-h1 tabular-nums">${jsx(c.figure)}</span>}` : ''}${c['figure-label'] ? ` figureLabel=${jsx(c['figure-label'])}` : ''}${c.note ? ` note=${jsx(c.note)}` : ''}${c.primary ? ` primaryAction={${button(c.primary, c['primary-href'], 'pill-outline')}}` : ''}${c.secondary ? (use('@/components/site/cta', 'CtaTextLink'), ` secondaryAction={<CtaTextLink href=${jsx(href(c['secondary-href']))}>${jsx(c.secondary)}</CtaTextLink>}`) : ''} /></SiteSection>`);
				break;
			case 'footer':
				use('@/components/site/site-footer', 'SiteFooter');
				parts.push(`<SiteFooter logo={${logo}}${c.description ? ` description=${jsx(c.description)}` : ''}${c.copyright ? ` copyright=${jsx(c.copyright)}` : ''}${items.length ? ` legal={${JSON.stringify(items.map((i) => ({ label: i.label, href: href(i.href) })))}}` : ''} />`);
				break;
		}
	}
	const head = [...imports].sort(([a], [b]) => (a < b ? -1 : 1)).map(([file, names]) => `import { ${[...names].sort().join(', ')} } from "${file}";`).join('\n');
	const body = `${head}\n\n// Written by \`design page compose\`${o.title ? ` for "${o.title.replace(/"/g, "'")}"` : ''}. Install what it imports with \`add\` first.\nexport default function Page() {\n  return (\n    <>\n${parts.map((p) => `      ${p}`).join('\n')}\n    </>\n  );\n}\n`;
	return { 'page.tsx': body };
}

/** The page as plain HTML: semantic markup the brand stylesheet styles, nothing else to install. */
function html(o: Outline): Record<string, string> {
	const css = readFileSync(pkgPath('build', 'site.css'), 'utf8');
	const out: string[] = [];
	const a = (label?: string, to?: string, cls = 'ds-button') => (label ? `<a class="${cls}" href="${esc(href(to))}">${esc(label)}</a>` : '');
	const h2 = (t?: string, accent?: string) => (t ? `<h2>${accent && t.includes(accent) ? esc(t).replace(esc(accent), `<span class="ds-accent">${esc(accent)}</span>`) : esc(t)}</h2>` : '');
	for (const s of o.sections as Section[]) {
		const c = s.copy ?? {};
		const items = s.items ?? [];
		switch (s.type) {
			case 'header':
				out.push(`<header class="ds-header"><a class="ds-logo" href="/">${esc(brand().name)}</a><nav>${items.map((i) => a(i.label, i.href, 'ds-link')).join('')}</nav>${a(c.action, c['action-href'])}</header>`);
				break;
			case 'hero':
				out.push(`<section class="ds-hero"><h1>${c.accent && c.title!.includes(c.accent) ? esc(c.title!).replace(esc(c.accent), `<span class="ds-accent">${esc(c.accent)}</span>`) : esc(c.title!)}</h1>${c.description ? `<p>${esc(c.description)}</p>` : ''}<div class="ds-actions">${a(c.primary, c['primary-href'])}${a(c.secondary, c['secondary-href'], 'ds-button ds-button-outline')}</div>${c.note ? `<p class="ds-note">${esc(c.note)}</p>` : ''}</section>`);
				break;
			case 'text':
				out.push(`<section>${h2(c.title, c.accent)}${c.body ? `<p>${esc(c.body)}</p>` : ''}</section>`);
				break;
			case 'features':
				out.push(`<section>${h2(c.title, c.accent)}${c.description ? `<p>${esc(c.description)}</p>` : ''}<div class="ds-grid">${items.map((i) => `<article class="ds-card"><h3>${esc(i.name!)}</h3><p>${esc(i.description!)}</p>${tags(i.tags).length ? `<ul class="ds-tags">${tags(i.tags).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${i.href ? a('Explore', i.href, 'ds-link') : ''}</article>`).join('')}</div></section>`);
				break;
			case 'stats':
				out.push(`<section>${h2(c.title)}<dl class="ds-stats">${items.map((i) => `<div><dt>${esc(i.label!)}</dt><dd>${esc(i.value!)}</dd></div>`).join('')}</dl></section>`);
				break;
			case 'testimonials':
				out.push(`<section>${h2(c.title, c.accent)}<div class="ds-grid">${items.map((i) => `<figure class="ds-card"><blockquote>${esc(i.quote!)}</blockquote><figcaption>${esc(i.name!)}, ${esc(i.role!)}</figcaption></figure>`).join('')}</div></section>`);
				break;
			case 'faq':
				out.push(`<section>${h2(c.title)}${c.description ? `<p>${esc(c.description)}</p>` : ''}${items.map((i) => `<details class="ds-card"><summary>${esc(i.question!)}</summary><p>${esc(i.answer!)}</p></details>`).join('')}</section>`);
				break;
			case 'blog':
				out.push(`<section>${h2(c.title)}<div class="ds-grid">${items.map((i) => `<article class="ds-card">${i.tag ? `<p class="ds-note">${esc(i.tag)}</p>` : ''}<h3>${a(i.title, i.href, 'ds-link')}</h3>${i.excerpt ? `<p>${esc(i.excerpt)}</p>` : ''}<time>${esc(i.date!)}</time></article>`).join('')}</div>${c['all-href'] ? a('All posts', c['all-href'], 'ds-link') : ''}</section>`);
				break;
			case 'cta':
				out.push(`<section class="ds-cta">${h2(c.title)}${c.description ? `<p>${esc(c.description)}</p>` : ''}${c.figure ? `<p class="ds-figure">${esc(c.figure)}${c['figure-label'] ? ` <span>${esc(c['figure-label'])}</span>` : ''}</p>` : ''}<div class="ds-actions">${a(c.primary, c['primary-href'])}${a(c.secondary, c['secondary-href'], 'ds-link')}</div>${c.note ? `<p class="ds-note">${esc(c.note)}</p>` : ''}</section>`);
				break;
			case 'footer':
				out.push(`<footer class="ds-footer"><p class="ds-logo">${esc(brand().name)}</p>${c.description ? `<p>${esc(c.description)}</p>` : ''}<nav>${items.map((i) => a(i.label, i.href, 'ds-link')).join('')}</nav>${c.copyright ? `<p class="ds-note">${esc(c.copyright)}</p>` : ''}</footer>`);
				break;
		}
	}
	const title = esc(o.title ?? brand().name);
	return { 'index.html': `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n<style>\n${css}\n${PAGE_CSS}</style>\n</head>\n<body class="ds-site">\n<main>\n${out.join('\n')}\n</main>\n</body>\n</html>\n` };
}

/** The few layout rules a plain page needs beyond the brand stylesheet: a column, sections, a grid. Tokens only. */
const PAGE_CSS = `main{max-width:72rem;margin:0 auto;padding:0 var(--ds-space-4,1rem)}
section,header,footer{padding:var(--ds-space-16,4rem) 0;border-bottom:1px solid var(--ds-color-border-hairline)}
header,footer{display:flex;flex-wrap:wrap;gap:var(--ds-space-6,1.5rem);align-items:center;justify-content:space-between;padding:var(--ds-space-4,1rem) 0}
nav{display:flex;flex-wrap:wrap;gap:var(--ds-space-4,1rem)}
.ds-hero{text-align:center}.ds-hero p{margin-inline:auto;max-width:40rem}
.ds-accent{color:var(--ds-color-text-brand)}
.ds-actions{display:flex;flex-wrap:wrap;gap:var(--ds-space-3,.75rem);justify-content:center;margin-top:var(--ds-space-6,1.5rem)}
.ds-button{display:inline-flex;align-items:center;border-radius:999px;padding:.6rem 1.2rem;background:var(--ds-color-black);color:var(--ds-color-white);text-decoration:none;transition:opacity 150ms ease-out}
.ds-button:hover{opacity:.85}.ds-button-outline{background:transparent;color:var(--ds-color-text-brand);box-shadow:inset 0 0 0 1px var(--ds-color-brand)}
.ds-link{color:var(--ds-color-text-brand)}.ds-note{color:var(--ds-color-text-muted);font-size:var(--ds-text-caption,.8rem)}
.ds-grid{display:grid;gap:var(--ds-space-4,1rem);grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));margin-top:var(--ds-space-8,2rem)}
.ds-card{background:var(--ds-color-white);border-radius:var(--ds-radius-card,1rem);padding:var(--ds-space-6,1.5rem);box-shadow:var(--ds-shadow-floating)}
.ds-tags{display:flex;flex-wrap:wrap;gap:.5rem;padding:0;list-style:none}
.ds-stats{display:grid;gap:var(--ds-space-6,1.5rem);grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))}.ds-stats dd{margin:0;font-size:var(--ds-text-h2,2rem);color:var(--ds-color-text-brand)}
.ds-cta{text-align:center}.ds-figure{font-size:var(--ds-text-h1,3rem);color:var(--ds-color-text-brand)}
`;

export async function writePage(o: Outline, flavor: string): Promise<Record<string, string>> {
	return flavor === 'react' ? react(o) : html(o);
}
