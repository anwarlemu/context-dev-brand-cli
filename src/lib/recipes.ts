import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { pkgPath } from './paths.js';

// Recipes: how the brand styles each kind of element in each situation (a primary button, a button on the brand
// color, a clickable card, a table row, a sidebar item...), learned from the brand's own site and dashboard. An agent
// restyling an existing site matches each element to its recipe and copies the declarations, so the element keeps its
// content and structure and takes the brand's look.

const declarations = z.record(z.string(), z.string());

export const recipeSchema = z.object({
	surface: z.enum(['marketing', 'product']),
	group: z.enum(['page', 'text', 'actions', 'forms', 'containers', 'navigation', 'data', 'feedback']),
	name: z.string().min(1),
	use_for: z.string().min(1),
	not_for: z.string().optional(),
	match: z.object({ tags: z.array(z.string()).default([]), classHints: z.array(z.string()).default([]), roles: z.array(z.string()).default([]), context: z.array(z.string()).default([]) }),
	css: declarations,
	states: z.record(z.string(), declarations).default({}),
	tailwind: z.string().default(''),
	rules: z.array(z.string()).default([]),
	source: z.array(z.string()).default([]),
});
export type Recipe = z.infer<typeof recipeSchema> & { id: string };

let cached: Recipe[] | undefined;
export function loadRecipes(): Recipe[] {
	if (cached) return cached;
	const path = pkgPath('styles', 'recipes.json');
	if (!existsSync(path)) return (cached = []);
	const raw = JSON.parse(readFileSync(path, 'utf8')) as { recipes: Record<string, unknown> };
	cached = Object.entries(raw.recipes).map(([id, r]) => ({ id, ...recipeSchema.parse(r) }));
	return cached;
}

export const findRecipe = (id: string) => loadRecipes().find((r) => r.id === id || r.id === `app-${id}`);

export type Surface = 'marketing' | 'product';

/** Which surface a file belongs to: the project's setting, else product for dashboard-like paths. */
export function surfaceFor(root: string, rel: string): Surface {
	try {
		const saved = JSON.parse(readFileSync(join(root, '.ds', 'config.json'), 'utf8')) as { surface?: string };
		if (saved.surface === 'marketing' || saved.surface === 'product') return saved.surface;
	} catch {}
	return /(^|\/)(\(?dashboard\)?|admin|console|settings|account|billing|\(app\)|app-shell|playground)(\/|$)/i.test(rel) ? 'product' : 'marketing';
}

const block = (selector: string, decls: Record<string, string>, indent = '') =>
	`${indent}${selector} {\n${Object.entries(decls)
		.map(([p, v]) => `${indent}  ${p}: ${v};`)
		.join('\n')}\n${indent}}`;

/** The recipe as CSS for a selector: base declarations, then each state. Hover is gated to real pointers. */
export function recipeCss(recipe: Recipe, selector = `.${recipe.id}`) {
	const out = [block(selector, recipe.css)];
	for (const [state, decls] of Object.entries(recipe.states)) {
		// `<media query or attribute> | <suffix>`: the suffix (a pseudo-element, a child) goes on the selector.
		const [head, suffix = ''] = state.split(' | ');
		if (head.startsWith('@media')) out.push(`${head} {\n${block(`${selector}${suffix}`, decls, '  ')}\n}`);
		else if (state.includes(' | ')) out.push(block(`${selector}${head}${suffix}`, decls));
		else if (state.includes('&')) out.push(block(state.replaceAll('&', selector), decls));
		else if (state === ':hover') out.push(`@media (hover: hover) and (pointer: fine) {\n${block(`${selector}:hover`, decls, '  ')}\n}`);
		else out.push(block(`${selector}${state}`, decls));
	}
	return out.join('\n');
}

export function renderRecipe(recipe: Recipe, { selector, format = 'both' }: { selector?: string; format?: 'css' | 'tailwind' | 'both' } = {}) {
	return [
		`${recipe.id}: ${recipe.name} (${recipe.surface}). ${recipe.use_for}${recipe.not_for ? ` Not for: ${recipe.not_for}` : ''}`,
		format !== 'tailwind' || !recipe.tailwind ? recipeCss(recipe, selector) : '',
		format !== 'css' && recipe.tailwind ? `Tailwind: ${recipe.tailwind}` : '',
		...recipe.rules.map((r) => `- ${r}`),
	]
		.filter(Boolean)
		.join('\n');
}

export type ComponentHit = { line: number; label: string; kind: string; recipe: string };

// Detection works in two steps: what kind of element this is (from its tag, its semantic class names and component
// name, its role, where it sits, and visual cues such as a link drawn as a button), then which recipe that kind uses on
// this surface. Utility classes (Tailwind's text-lg, px-4) are cues, never names, so they cannot pass as a recipe.
type Element = { tag: string; names: string; utilities: string; attrs: string; context: string[] };

const KIND_RECIPES: Record<Surface, Record<string, string>> = {
	marketing: {
		page: 'page-background', display: 'text-display', h1: 'text-h1', h2: 'text-h2', h3: 'text-h3', h4: 'text-h4', h5: 'text-h5', lede: 'text-lede', body: 'text-body', small: 'text-small', eyebrow: 'text-eyebrow',
		link: 'link-inline', 'nav-link': 'link-nav', 'footer-link': 'link-footer', 'link-arrow': 'link-arrow',
		'button-primary': 'button-primary', 'button-secondary': 'button-secondary', 'button-quiet': 'button-quiet', 'button-danger': 'button-secondary', 'button-icon': 'button-icon', 'button-on-brand': 'button-on-brand', 'button-on-dark': 'button-on-dark',
		input: 'input-text', search: 'input-text', textarea: 'textarea', select: 'select', checkbox: 'checkbox', label: 'label', 'help-text': 'help-text', 'field-error': 'field-error',
		tab: 'tabs', 'menu-item': 'dropdown-menu', 'menu-panel': 'dropdown-menu', tooltip: 'tooltip', dialog: 'dialog', toast: 'toast',
		table: 'table', header: 'header', nav: 'header', footer: 'footer', breadcrumb: 'breadcrumb',
		'code-inline': 'code-inline', 'code-block': 'code-window', quote: 'blockquote', list: 'list-bulleted', section: 'section', 'section-blue': 'section-surface-blue', 'section-dark': 'section-surface-dark', media: 'media-frame',
		card: 'card', 'card-clickable': 'card-clickable', 'card-feature': 'card-feature', 'card-pricing': 'card-pricing', 'card-pricing-featured': 'card-pricing-featured',
		badge: 'badge', status: 'status-pill', banner: 'callout-banner', testimonial: 'testimonial-card', faq: 'faq-item', stat: 'stat-figure', 'empty-state': 'card',
	},
	product: {
		page: 'app-canvas', display: 'app-text-page-title', h1: 'app-text-page-title', h2: 'app-text-card-title', h3: 'app-text-card-title', h4: 'app-text-section-label', h5: 'app-text-section-label', lede: 'app-text-body', body: 'app-text-body', small: 'app-text-caption', eyebrow: 'app-text-section-label',
		link: 'app-link-inline', 'nav-link': 'app-sidebar-item', 'footer-link': 'app-link-inline', 'link-arrow': 'app-link-arrow',
		'button-primary': 'app-button-brand', 'button-secondary': 'app-button-outline', 'button-quiet': 'app-button-ghost', 'button-danger': 'app-button-danger', 'button-icon': 'app-icon-button', 'button-on-brand': 'app-button-outline', 'button-on-dark': 'app-button-outline',
		input: 'app-input', search: 'app-search-field', textarea: 'app-textarea', select: 'app-select', checkbox: 'app-checkbox', switch: 'app-switch', label: 'app-text-label', 'help-text': 'app-field-message', 'field-error': 'app-field-message',
		tab: 'app-tab', 'menu-item': 'app-menu-item', 'menu-panel': 'app-menu-panel', tooltip: 'app-tooltip', dialog: 'app-dialog', drawer: 'app-drawer',
		table: 'app-table', 'table-row': 'app-table-row', 'table-header-cell': 'app-table-header-cell', 'table-cell': 'app-table-cell', header: 'app-top-bar', nav: 'app-sidebar', sidebar: 'app-sidebar', breadcrumb: 'app-breadcrumb', pagination: 'app-pagination',
		'code-inline': 'app-text-mono', 'code-block': 'app-code-card', card: 'app-card', 'card-clickable': 'app-card-interactive', 'card-feature': 'app-card', 'card-pricing': 'app-card', 'card-pricing-featured': 'app-card',
		badge: 'app-badge', status: 'app-status-dot', banner: 'app-banner', stat: 'app-stat-card', skeleton: 'app-skeleton', 'empty-state': 'app-empty-state', progress: 'app-progress-bar',
	},
};

const UTILITY = /[:[\]/]|^-?(text|bg|border|rounded|p[xytrbl]?|m[xytrbl]?|flex|grid|gap|font|tracking|leading|w|h|size|max|min|shadow|items|justify|self|space|inset|top|left|right|bottom|z|opacity|transition|duration|ease|overflow|block|inline|hidden|relative|absolute|fixed|sticky|col|row|order|ring|outline|underline|no-underline|truncate|whitespace|break|cursor|select|pointer|object|aspect|fill|stroke|translate|scale|rotate|animate|sr|not|group|peer|container|mx|my|uppercase|lowercase|capitalize|italic|antialiased|shrink|grow|basis|place|content|list|divide|backdrop|blur|filter)(-|$)/;

function splitClasses(classes: string[]) {
	const names: string[] = [];
	const utilities: string[] = [];
	for (const c of classes) (UTILITY.test(c) ? utilities : names).push(c.toLowerCase());
	return { names: names.join(' ').replace(/[_-]+/g, ' '), utilities: utilities.join(' ') };
}

function buttonKind(el: Element) {
	const n = el.names;
	const variant = el.attrs.match(/variant\s*=\s*["'{]*([\w-]+)/)?.[1]?.toLowerCase() ?? '';
	if (/danger|destructive|delete|remove/.test(`${n} ${variant}`)) return 'button-danger';
	if (/ghost|quiet|tertiary|text button|link button|plain/.test(`${n} ${variant}`) || variant === 'link') return 'button-quiet';
	if (/icon/.test(n) || variant === 'icon') return 'button-icon';
	if (/secondary|outline|bordered/.test(`${n} ${variant}`)) return 'button-secondary';
	const filled = /(^|\s)bg-(?!transparent|none)/.test(el.utilities) || /background(-color)?\s*:\s*(?!transparent|none)/.test(el.attrs);
	const bordered = /(^|\s)border(\s|$|-(?!0|none))/.test(el.utilities) || /border\s*:\s*(?!0|none)/.test(el.attrs);
	if (!filled && bordered) return 'button-secondary';
	if (el.context.includes('section-blue')) return 'button-on-brand';
	if (el.context.includes('section-dark')) return 'button-on-dark';
	return 'button-primary';
}

/** Whether a link is drawn as a button: a button class name, or a fill or border together with padding. */
const looksLikeButton = (el: Element) =>
	/\b(btn|button|cta)\b/.test(el.names) || ((/(^|\s)(bg-|border)/.test(el.utilities) || /background|border/.test(el.attrs)) && /(^|\s)(p[xy]?-|rounded)/.test(el.utilities));

export function kindOf(el: Element): string | undefined {
	const n = el.names;
	const has = (re: RegExp) => re.test(n);
	const role = el.attrs.match(/role\s*=\s*["']?([\w-]+)/)?.[1];
	const type = el.attrs.match(/type\s*=\s*["']?([\w-]+)/)?.[1];
	if (role === 'switch' || (has(/\b(switch|toggle)\b/) && ['button', 'input'].includes(el.tag))) return 'switch';
	if (role === 'tab' || has(/\btab\b/)) return 'tab';
	if (role === 'menuitem' || has(/\bmenu item\b/)) return 'menu-item';
	if (role === 'tooltip' || has(/\btooltip\b/)) return 'tooltip';
	if (el.tag === 'dialog' || role === 'dialog' || has(/\b(modal|dialog)\b/)) return 'dialog';
	switch (el.tag) {
		case 'html':
		case 'body':
			return 'page';
		case 'h1':
			return el.context.includes('hero') || has(/\b(hero|display|headline)\b/) ? 'display' : 'h1';
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
			return el.tag;
		case 'h6':
			return 'h5';
		case 'p':
			if (has(/\b(lede|lead|intro|subtitle|subhead|subheading|tagline|summary|description)\b/) || (el.context.includes('hero') && !has(/\b(small|caption)\b/))) return 'lede';
			if (has(/\b(eyebrow|overline|kicker)\b/)) return 'eyebrow';
			if (has(/\b(error|invalid)\b/)) return 'field-error';
			if (has(/\b(help|hint)\b/)) return 'help-text';
			if (/(^|\s)text-(lg|xl|2xl)\b/.test(el.utilities)) return 'lede';
			return has(/\b(small|caption|meta|note|fine|footnote)\b/) || /(^|\s)text-(xs|sm)\b/.test(el.utilities) ? 'small' : 'body';
		case 'small':
			return 'small';
		case 'a':
			if (has(/\b(card|tile)\b/)) return 'card-clickable';
			if (looksLikeButton(el)) return buttonKind(el);
			if (el.context.includes('sidebar') || el.context.includes('nav') || el.context.includes('header')) return 'nav-link';
			if (el.context.includes('footer')) return 'footer-link';
			return has(/\b(arrow|more)\b/) ? 'link-arrow' : 'link';
		case 'button':
			return buttonKind(el);
		case 'input':
			if (type === 'checkbox' || type === 'radio') return 'checkbox';
			if (type === 'submit' || type === 'button') return buttonKind(el);
			if (type === 'hidden') return undefined;
			return type === 'search' || has(/\bsearch\b/) || /placeholder\s*=\s*["']search/i.test(el.attrs) ? 'search' : 'input';
		case 'textarea':
		case 'select':
		case 'label':
		case 'table':
			return el.tag;
		case 'tr':
			return el.context.includes('thead') ? undefined : 'table-row';
		case 'th':
			return 'table-header-cell';
		case 'td':
			return 'table-cell';
		case 'nav':
			if (has(/\bbreadcrumb/)) return 'breadcrumb';
			if (has(/\bpagination\b/)) return 'pagination';
			return el.context.includes('header') ? undefined : has(/\b(sidebar|side nav|sidenav)\b/) || el.context.includes('aside') ? 'sidebar' : 'nav';
		case 'header':
			return el.context.includes('header') || el.context.includes('article') ? undefined : 'header';
		case 'footer':
			return el.context.includes('article') ? undefined : 'footer';
		case 'aside':
			return has(/\b(sidebar|side nav|sidenav)\b/) ? 'sidebar' : undefined;
		case 'code':
			return el.context.includes('pre') ? undefined : 'code-inline';
		case 'pre':
			return 'code-block';
		case 'blockquote':
			return 'quote';
		case 'progress':
			return 'progress';
	}
	if (has(/\b(pricing|plan|tier)\b/)) return has(/\b(featured|popular|highlight|highlighted|recommended)\b/) ? 'card-pricing-featured' : 'card-pricing';
	if (has(/\bhero\b/)) return el.tag === 'section' ? 'section' : undefined;
	if (has(/\b(card|tile|panel)\b/)) return has(/\bfeature/) ? 'card-feature' : 'card';
	if (has(/\b(badge|chip|tag|pill)\b/)) return 'badge';
	if (has(/\bstatus\b/)) return 'status';
	if (has(/\b(banner|callout|alert|notice)\b/)) return 'banner';
	if (has(/\b(toast|snackbar)\b/)) return 'toast';
	if (has(/\b(testimonial|quote)\b/)) return 'testimonial';
	if (has(/\b(faq|accordion)\b/)) return 'faq';
	if (has(/\bempty\b/)) return 'empty-state';
	if (has(/\b(stat|metric|kpi)\b/)) return 'stat';
	if (has(/\bskeleton\b/)) return 'skeleton';
	if (has(/\b(dropdown|popover|menu)\b/)) return 'menu-panel';
	if (has(/\bdrawer\b/)) return 'drawer';
	if (has(/\bbreadcrumb/)) return 'breadcrumb';
	if (has(/\b(btn|button|cta)\b/)) return buttonKind(el);
	if (has(/\b(input|field|text field)\b/)) return 'input';
	if (has(/\b(screenshot|frame|media)\b/) && ['img', 'figure', 'video', 'picture'].includes(el.tag)) return 'media';
	if (el.tag === 'section') return has(/\b(blue|brand)\b/) ? 'section-blue' : has(/\b(dark|inverse|black)\b/) ? 'section-dark' : 'section';
	if ((el.tag === 'ul' || el.tag === 'ol') && has(/\b(list|features|checklist|bullets)\b/)) return 'list';
	return undefined;
}

/** The labels an element gives the elements inside it: its tag when that frames them (nav, footer, table) and hints. */
function contextLabels(tag: string, names: string) {
	const labels: string[] = [];
	if (['nav', 'header', 'footer', 'form', 'table', 'thead', 'aside', 'dialog', 'pre', 'article'].includes(tag)) labels.push(tag);
	if (/\bhero\b/.test(names)) labels.push('hero');
	if (/\b(sidebar|side nav|sidenav)\b/.test(names)) labels.push('sidebar');
	if (/\b(nav|navbar|menu)\b/.test(names)) labels.push('nav');
	if (/\bfooter\b/.test(names)) labels.push('footer');
	if (/\b(blue|brand) (section|band|surface)|on brand\b/.test(names)) labels.push('section-blue');
	if (/\b(dark|inverse) (section|band|surface)\b/.test(names)) labels.push('section-dark');
	return labels;
}

const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'embed', 'wbr']);

/** Finds the elements of a page or stylesheet that have a recipe: markup tags and components, or CSS selectors. */
export function detectComponents(rel: string, text: string, surface: Surface): ComponentHit[] {
	const recipes = new Set(loadRecipes().map((r) => r.id));
	if (!recipes.size) return [];
	const lineAt = (offset: number) => text.slice(0, offset).split('\n').length;
	const hits: ComponentHit[] = [];
	const push = (offset: number, label: string, el: Element) => {
		const kind = kindOf(el);
		const recipe = kind ? KIND_RECIPES[surface][kind] : undefined;
		if (kind && recipe && recipes.has(recipe)) hits.push({ line: lineAt(offset), label: label.replace(/\s+/g, ' '), kind, recipe });
	};
	if (/\.(css|scss)$/.test(rel)) {
		for (const m of text.matchAll(/(^|[};])\s*([^{}@;/][^{};]*?)\s*\{/g)) {
			const selector = m[2].trim().split(',')[0].trim();
			if (!selector || selector.startsWith(':root') || /^(from|to|\d+%)$/.test(selector) || /::?(before|after|placeholder|-webkit)/.test(selector)) continue;
			const compounds = selector.split(/\s*[>+~]\s*|\s+/).filter(Boolean);
			const last = compounds.pop() ?? '';
			const tag = (last.match(/^[a-z][a-z0-9]*/i)?.[0] ?? 'div').toLowerCase();
			const { names, utilities } = splitClasses([...last.matchAll(/\.([\w-]+)/g)].map((c) => c[1]));
			const context = compounds.flatMap((c) => contextLabels((c.match(/^[a-z][a-z0-9]*/i)?.[0] ?? '').toLowerCase(), splitClasses([...c.matchAll(/\.([\w-]+)/g)].map((x) => x[1])).names));
			if (/:(hover|focus|active|disabled|visited|focus-visible|checked)/.test(last)) continue;
			push(m.index + m[1].length, selector.length > 60 ? `${selector.slice(0, 57)}...` : selector, { tag, names, utilities, attrs: last.match(/\[[^\]]*\]/g)?.join(' ') ?? '', context });
		}
		return hits;
	}
	// A file named for the hero (Hero.tsx, hero.astro) is the hero all the way through.
	const stack: { name: string; labels: string[] }[] = /(^|\/)[^/]*hero[^/]*$/i.test(rel) ? [{ name: '#file', labels: ['hero'] }] : [];
	for (const m of text.matchAll(/<(\/?)([A-Za-z][\w.-]*)((?:[^<>"'{}]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})*?)(\/?)>/g)) {
		const [, closing, rawName, attrs, selfClosing] = m;
		const name = rawName.toLowerCase();
		if (closing) {
			const at = stack.map((s) => s.name).lastIndexOf(name);
			if (at >= 0) stack.splice(at);
			continue;
		}
		// A component's name reads like a class name, so <Button variant="outline"> and <PricingCard> are recognized.
		const component = /^[A-Z]/.test(rawName) ? (rawName.split('.').pop() ?? '').replace(/([a-z])([A-Z])/g, '$1 $2') : '';
		const classAttr = attrs.match(/class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([\s\S]*?)\}(?=\s|$|\/))/);
		const classText = classAttr ? (classAttr[1] ?? classAttr[2] ?? (classAttr[3] ?? '').match(/["'`]([^"'`]*)["'`]/g)?.join(' ') ?? '') : '';
		const split = splitClasses(classText.replace(/["'`]/g, ' ').split(/\s+/).filter(Boolean));
		const names = `${split.names} ${component.toLowerCase()}`.trim();
		const tag = component ? (/\bbutton\b/i.test(component) ? 'button' : /\b(link|anchor)\b/i.test(component) ? 'a' : /\b(input|text field)\b/i.test(component) ? 'input' : /\btextarea\b/i.test(component) ? 'textarea' : /\bselect\b/i.test(component) ? 'select' : 'div') : name;
		const context = stack.flatMap((s) => s.labels);
		push(m.index, `<${rawName}${attrs.length > 50 ? `${attrs.slice(0, 47)}...` : attrs}>`, { tag, names, utilities: split.utilities, attrs, context });
		if (!selfClosing && !VOID.has(name)) stack.push({ name, labels: contextLabels(tag, names) });
	}
	return hits;
}
