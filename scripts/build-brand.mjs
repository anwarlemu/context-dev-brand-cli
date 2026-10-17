// Composes what the CLI installs from brand/: one stylesheet for a site, one for a product, the Tailwind 4 theme,
// the font import, and a flat token index the engine reads. brand/tokens.css stays the single source.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../brand/${p}`, import.meta.url), 'utf8');
const tokens = read('tokens.css');
const blocks = [...tokens.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim(), body: m[2] }));
const root = blocks.find((b) => b.selector === ':root');
const product = blocks.find((b) => b.selector === '.ds-product');
const dark = blocks.find((b) => b.selector.includes('dark'));
if (!root || !product || !dark) throw new Error('brand/tokens.css needs :root, .ds-product and a dark block');
const vars = (body) => Object.fromEntries([...body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const header = '/* Written by context-ds from its brand files. Do not edit; run the CLI again to update. */\n';
// A site may also hold product screens (an app behind the marketing pages): they opt in with the ds-product class.
const site = `${header}:root {${root.body}}\n\n.ds-product {${product.body}}\n\n.dark .ds-product,\n[data-theme="dark"] .ds-product,\n.ds-product:is(.dark, [data-theme="dark"]) {${dark.body}}\n\n${read('site.css')}`;
// A product project is a product everywhere, so its values apply at the root; its dark theme follows the app's own switch.
const productCss = `${header}:root {${root.body}}\n\n:root {${product.body}}\n\n:root:is(.dark, [data-theme="dark"]),\n.dark .ds-product,\n[data-theme="dark"] .ds-product {${dark.body}}\n\n${read('product.css')}`;

// Tailwind 4: theme names that read the brand variables, so classes like bg-surface or text-fg-muted work.
const t = vars(root.body);
// shadcn's role names first, as aliases of the same tokens, so shadcn components and apps read the brand; the brand's
// own names come after so they stay the names the engine suggests.
const shadcnRoles = {
	background: 'bg-default', foreground: 'text-default', card: 'bg-default', 'card-foreground': 'text-default', popover: 'bg-default', 'popover-foreground': 'text-default',
	'primary-foreground': 'action-primary-fg', secondary: 'bg-subtle', 'secondary-foreground': 'text-default', muted: 'bg-subtle', 'muted-foreground': 'text-muted',
	accent: 'wash-hover', 'accent-foreground': 'text-default', destructive: 'status-danger', border: 'border-default', input: 'border-default', ring: 'focus-ring',
};
const color = {
	...shadcnRoles,
	brand: 'brand', black: 'black', white: 'white', primary: 'action-primary', 'primary-hover': 'action-primary-hover',
	surface: 'bg-default', subtle: 'bg-subtle', frame: 'bg-frame', canvas: 'bg-canvas', tint: 'bg-tint', inverse: 'bg-inverse', dark: 'bg-dark', code: 'bg-code', scrim: 'bg-scrim', announcement: 'bg-announcement',
	fg: 'text-default', 'fg-secondary': 'text-secondary', 'fg-muted': 'text-muted', 'fg-subtle': 'text-subtle', 'fg-faint': 'text-faint', 'fg-nav': 'text-nav', 'fg-inverse': 'text-inverse', 'fg-brand': 'text-brand', 'on-brand': 'text-on-brand',
	line: 'border-default', 'line-subtle': 'border-subtle', 'line-strong': 'border-strong', hairline: 'border-hairline', rule: 'border-rule', node: 'border-node',
	'ring-tint': 'ring-tint', 'ring-on-brand': 'ring-on-brand', 'wash-hover': 'wash-hover', 'wash-pill': 'wash-pill', 'wash-selected': 'wash-selected',
	success: 'status-success', warning: 'status-warning', danger: 'status-danger',
	'window-close': 'window-close', 'window-minimize': 'window-minimize', 'window-zoom': 'window-zoom',
};
for (const name of Object.keys(t)) {
	const m = name.match(/^--ds-color-((?:blue|navy|neutral)-\d+|chart-series-\d)$/);
	if (m) color[m[1].replace('chart-', '')] = m[1];
}
const theme = [
	...Object.entries(color).map(([k, v]) => `\t--color-${k}: var(--ds-color-${v});`),
	...['sans', 'data', 'mono'].map((k) => `\t--font-${k}: var(--ds-font-${k});`),
	...Object.keys(t).filter((k) => k.startsWith('--ds-text-')).map((k) => `\t--text-${k.slice(10)}: var(${k});`),
	...Object.keys(t).filter((k) => k.startsWith('--ds-leading-')).map((k) => `\t--leading-${k.slice(13)}: var(${k});`),
	...Object.keys(t).filter((k) => k.startsWith('--ds-tracking-')).map((k) => `\t--tracking-${k.slice(14)}: var(${k});`),
	...Object.keys(t).filter((k) => k.startsWith('--ds-radius-')).map((k) => `\t--radius-${k.slice(12)}: var(${k});`),
	...Object.keys(t).filter((k) => k.startsWith('--ds-shadow-')).map((k) => `\t--shadow-${k.slice(12)}: var(${k});`),
	'\t--ease-out: var(--ds-easing-out);',
	'\t--ease-in-out: var(--ds-easing-in-out);',
];
// Motion for popovers, tooltips and menus: a short ease-out pop, only a fade with reduced motion (Emil Kowalski's rules).
const motion = `@theme {
	--animate-pop-in: ds-pop-in var(--ds-duration-fast) var(--ds-easing-out);
	--animate-fade-in: ds-fade-in var(--ds-duration-fast) var(--ds-easing-out);
	--animate-content-in: ds-content-in var(--ds-duration-base) var(--ds-easing-out);
	--animate-shimmer: ds-shimmer 1.6s var(--ds-easing-in-out) infinite;
	--animate-spin-slow: spin 0.8s linear infinite;
	--animate-accordion-down: ds-accordion-down var(--ds-duration-base) var(--ds-easing-out);
	--animate-accordion-up: ds-accordion-up var(--ds-duration-fast) var(--ds-easing-out);
	--animate-chart-line: ds-chart-line 900ms var(--ds-easing-out) backwards;
	--animate-chart-area: ds-fade-in 600ms var(--ds-easing-out) 250ms backwards;
	--animate-chart-tip: ds-chart-tip 360ms var(--ds-easing-out) backwards;
	--animate-chart-bar: ds-chart-bar 420ms var(--ds-easing-out) backwards;

	@keyframes ds-pop-in {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
	}

	@keyframes ds-fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-content-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	@keyframes ds-sheet-right {
		from {
			opacity: 0;
			transform: translateX(12px);
		}
	}

	@keyframes ds-sheet-left {
		from {
			opacity: 0;
			transform: translateX(-12px);
		}
	}

	@keyframes ds-accordion-down {
		from {
			height: 0;
		}
		to {
			height: var(--radix-accordion-content-height);
		}
	}

	@keyframes ds-accordion-up {
		from {
			height: var(--radix-accordion-content-height);
		}
		to {
			height: 0;
		}
	}

	@keyframes ds-chart-line {
		from {
			stroke-dashoffset: 1;
		}
	}

	@keyframes ds-chart-tip {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
	}

	@keyframes ds-chart-bar {
		from {
			transform: scaleY(0.04);
		}
	}

	@keyframes ds-shimmer {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(100%);
		}
	}
}

@media (prefers-reduced-motion: reduce) {
	@keyframes ds-pop-in {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-content-in {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-sheet-right {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-sheet-left {
		from {
			opacity: 0;
		}
	}
}
`;
const themeCss = `${header}@theme inline {\n${theme.join('\n')}\n}\n\n${motion}`;
const fonts = `${header}@import url("https://fonts.googleapis.com/css2?family=Doto:wght@800&family=IBM+Plex+Mono:wght@400;500&family=Rethink+Sans:wght@400;500&display=swap");\n`;

mkdirSync(new URL('../build', import.meta.url), { recursive: true });
const write = (p, s) => writeFileSync(new URL(`../build/${p}`, import.meta.url), s);
write('site.css', site);
// Tokens alone (site at the root, product under .ds-product, both darks), for the component library and its docs.
write('tokens.css', `${header}:root {${root.body}}\n\n.ds-product {${product.body}}\n\n:is(.dark, [data-theme="dark"]) .ds-product,\n.ds-product:is(.dark, [data-theme="dark"]) {${dark.body}}\n`);
write('product.css', productCss);
write('theme.css', themeCss);
write('fonts.css', fonts);
write('tokens.json', `${JSON.stringify({ site: t, product: { ...t, ...vars(product.body) }, dark: vars(dark.body), theme: color }, null, 1)}\n`);
console.log(`brand: ${Object.keys(t).length} tokens, site.css, product.css, theme.css, fonts.css, tokens.json`);
