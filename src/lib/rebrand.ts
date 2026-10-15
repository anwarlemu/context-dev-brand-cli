import { readFileSync } from 'node:fs';
import { pkgPath } from './paths.js';

// Converts a site's own styling to the brand, declaration by declaration, keeping every selector, rule and element.
// Colors are mapped by the role they play on the site, measured against the site's own background and text: a
// near-black surface on a dark site and a white surface on a light one both become the brand background, white text
// on a dark site and black text on a light one both become brand text, and a translucent white hairline on a dark site
// becomes a translucent black one. Type, radius, spacing and motion move to the nearest brand token.

type RGBA = [number, number, number, number];

const NAMED: Record<string, RGBA> = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };

export function parseColor(raw: string): RGBA | undefined {
	const v = raw.trim().toLowerCase();
	if (NAMED[v]) return NAMED[v];
	const hex = v.match(/^#([0-9a-f]{3,8})$/)?.[1];
	if (hex) {
		const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
		const n = (i: number) => Number.parseInt(full.slice(i, i + 2), 16);
		return [n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1];
	}
	const fn = v.match(/^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
	if (fn) {
		const ch = (s: string) => (s.endsWith('%') ? (Number.parseFloat(s) * 255) / 100 : Number(s));
		const a = fn[4] === undefined ? 1 : fn[4].endsWith('%') ? Number.parseFloat(fn[4]) / 100 : Number(fn[4]);
		return [ch(fn[1]), ch(fn[2]), ch(fn[3]), a];
	}
	const hsl = v.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)$/);
	if (hsl) {
		const a = hsl[4] === undefined ? 1 : hsl[4].endsWith('%') ? Number.parseFloat(hsl[4]) / 100 : Number(hsl[4]);
		return fromHsl(Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100, a);
	}
	return undefined;
}

export function fromHsl(hue: number, s: number, l: number, a = 1): RGBA {
	const h = hue / 360;
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const f = (t: number) => {
		const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
		return 255 * (x < 1 / 6 ? p + (q - p) * 6 * x : x < 1 / 2 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p);
	};
	return [f(h + 1 / 3), f(h), f(h - 1 / 3), a];
}

function hsl([r, g, b]: RGBA) {
	const [R, G, B] = [r / 255, g / 255, b / 255];
	const max = Math.max(R, G, B);
	const min = Math.min(R, G, B);
	const l = (max + min) / 2;
	const d = max - min;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	let h = 0;
	if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
	return { h: (h * 60 + 360) % 360, s, l };
}

export type SitePalette = { mode: 'dark' | 'light'; bg: number; fg: number; series?: Map<string, number>; vars?: Map<string, string>; usage?: Map<string, Family>; modes?: Map<string, 'dark' | 'light'>; found?: boolean };

/** The palette for rules that only apply in the other theme (a site's own dark or light mode block). */
function themed(palette: SitePalette, mode: 'dark' | 'light' | undefined): SitePalette {
	if (!mode || mode === palette.mode) return palette;
	return { ...palette, mode, bg: mode === 'dark' ? 0.08 : 1, fg: mode === 'dark' ? 0.95 : 0 };
}

/** The site's background and text lightness, from its own variables or its body rule; a light page if neither says. */
export function sitePalette(css: string): SitePalette {
	const vars = new Map<string, string>();
	for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) if (!vars.has(m[1])) vars.set(m[1], m[2].trim());
	const resolve = (v?: string, depth = 0): RGBA | undefined => {
		if (!v) return undefined;
		const ref = v.match(/^var\((--[\w-]+)/)?.[1];
		return ref && depth < 5 ? resolve(vars.get(ref), depth + 1) : parseColor(v);
	};
	const pick = (re: RegExp) => [...vars].find(([n, v]) => re.test(n) && resolve(v))?.[1];
	const body = css.match(/(?:^|[}\s])body\s*\{([^}]*)\}/)?.[1] ?? '';
	const bg = resolve(body.match(/background(?:-color)?\s*:\s*([^;]+)/)?.[1]) ?? resolve(pick(/^--(bg|background|surface|paper|canvas|base)$/)) ?? resolve(pick(/(bg|background|paper|canvas)/));
	const fg = resolve(body.match(/(?:^|;|\s)color\s*:\s*([^;]+)/)?.[1]) ?? resolve(pick(/^--(ink|text|fg|foreground|body)$/)) ?? resolve(pick(/(ink|text|fg|foreground)/));
	const lbg = bg ? hsl(bg).l : 1;
	const lfg = fg ? hsl(fg).l : lbg > 0.5 ? 0 : 1;
	const { usage, modes } = variableUse(css);
	return { mode: lbg < 0.4 ? 'dark' : 'light', bg: lbg, fg: Math.abs(lfg - lbg) < 0.2 ? 1 - lbg : lfg, vars, usage, modes, found: !!bg };
}

export type Family = 'text' | 'border' | 'surface';

/** Which kind of color a declaration sets, from the property, or for a custom property from its name. */
export function familyOf(prop: string): Family {
	const p = prop.toLowerCase();
	if (p.startsWith('--')) {
		if (/(border|line|rule|divider|stroke|outline|hairline|separator)/.test(p)) return 'border';
		if (/(bg|background|surface|paper|canvas|base|card|panel|elev|overlay|fill)/.test(p)) return 'surface';
		if (/(ink|text|fg|foreground|copy|heading|title|muted|subtle|faint|label)/.test(p)) return 'text';
		return 'surface';
	}
	if (/shadow|^filter$|^backdrop-filter$/.test(p)) return 'border';
	if (/^(color|fill|stroke|caret-color|text-decoration-color|-webkit-text-fill-color|column-rule-color)$/.test(p) || p.startsWith('text-')) return p === 'fill' || p === 'stroke' ? 'text' : 'text';
	if (/^(border|outline)/.test(p)) return 'border';
	return 'surface';
}

/** A brand color token (its name after --ds-color-) and how opaque it is used. */
export type ColorToken = { name: string; alpha: number };

const token = (name: string, alpha = 1) => (alpha >= 0.995 ? `var(--ds-color-${name})` : `color-mix(in srgb, var(--ds-color-${name}) ${Math.round(alpha * 1000) / 10}%, transparent)`);
export const cssColor = (t: ColorToken | 'transparent') => (t === 'transparent' ? 'transparent' : token(t.name, t.alpha));

/**
 * The brand token for the role a color plays on this site. A `series` key (a chart's colors, by the name they were
 * declared under) keeps each data series its own brand series color instead of turning them all brand blue.
 */
export function colorToken(rgba: RGBA, family: Family, palette: SitePalette, series?: string): ColorToken | 'transparent' {
	const { h, s, l } = hsl(rgba);
	const a = rgba[3];
	if (a === 0) return 'transparent';
	if (s > 0.3 && l > 0.12 && l < 0.88) {
		if (series && palette.series) {
			const seen = palette.series;
			if (!seen.has(series)) seen.set(series, (seen.size % 4) + 1);
			return { name: `chart-series-${seen.get(series)}`, alpha: a };
		}
		if (h >= 85 && h < 165) return { name: 'status-success', alpha: a };
		if (h < 18 || h >= 345) return { name: 'status-danger', alpha: a };
		if (h >= 18 && h < 60) return { name: 'status-warning', alpha: a };
		return { name: family === 'text' ? 'text-brand' : family === 'border' ? 'border-brand' : 'bg-brand', alpha: a };
	}
	// A pale tint of a hue (an info box, a selected row) is the brand tint; a pale status color stays its status, faint.
	if (s > 0.3 && l >= 0.88 && family === 'surface' && a >= 0.995) {
		if (h >= 85 && h < 165) return { name: 'status-success', alpha: 0.1 };
		if (h < 18 || h >= 345) return { name: 'status-danger', alpha: 0.1 };
		if (h >= 18 && h < 60) return { name: 'status-warning', alpha: 0.12 };
		return { name: 'bg-tint', alpha: 1 };
	}
	// How far this neutral sits from the site's background toward its text: 0 is the page, 1 is the main text.
	const t = Math.max(0, Math.min(1, (l - palette.bg) / (palette.fg - palette.bg || 1)));
	// Translucent: a tint of the text color stays one; a tint of the page (a glass header, a fade into the page) stays
	// the page color, so it does not turn into a gray smudge. Shadows and lines are drawn in black.
	if (a < 0.995) return t > 0.5 ? { name: 'text-default', alpha: a } : { name: family === 'surface' ? 'bg-default' : 'black', alpha: a };
	const pick = (name: string) => ({ name, alpha: 1 });
	if (family === 'text') return pick(t > 0.82 ? 'text-default' : t > 0.55 ? 'text-muted' : t > 0.25 ? 'text-subtle' : 'text-inverse');
	if (family === 'border') return pick(t < 0.12 ? 'border-subtle' : t < 0.32 ? 'border-default' : t < 0.6 ? 'border-strong' : 'text-default');
	return pick(t < 0.015 ? 'bg-default' : t < 0.09 ? 'bg-subtle' : t < 0.2 ? 'bg-frame' : t < 0.45 ? 'border-strong' : t < 0.82 ? 'text-subtle' : 'action-primary');
}

const strong = (c: RGBA) => {
	const { s, l } = hsl(c);
	return s > 0.3 && l > 0.12 && l < 0.88 && c[3] > 0.5;
};

/** Text on a strong color (a blue button, a green badge) is the brand's text on color, not body text. */
function onColor(rgba: RGBA, family: Family, background?: RGBA, palette?: SitePalette): ColorToken | undefined {
	if (family !== 'text' || !background || strong(rgba)) return undefined;
	if (strong(background)) return { name: 'text-on-brand', alpha: rgba[3] };
	// A panel drawn in the opposite of the page (a dark tooltip on a light page): its text stays readable on it.
	if (!palette || background[3] < 0.9) return undefined;
	const at = (c: RGBA) => (hsl(c).l - palette.bg) / (palette.fg - palette.bg || 1);
	if (at(background) < 0.75 || at(rgba) > 0.5) return undefined;
	return { name: 'text-inverse', alpha: at(rgba) < 0.2 ? rgba[3] : Math.round(rgba[3] * 70) / 100 };
}

/** One color, as the CSS for the brand token it maps to. */
export function mapColor(rgba: RGBA, family: Family, palette: SitePalette, series?: string): string {
	return cssColor(colorToken(rgba, family, palette, series));
}

const COLOR_IN_VALUE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^()]*\)|(?<![\w-])(?:white|black)(?![\w-])/g;

let brandSizes: { text: [string, number][]; space: [string, number][]; radius: [string, number][]; duration: [string, number][] } | undefined;
function scales() {
	if (brandSizes) return brandSizes;
	const css = readFileSync(pkgPath('build', 'tokens.css'), 'utf8').split(/\n\}/)[0];
	const read = (re: RegExp, unit: number) => [...css.matchAll(re)].map((m) => [m[1], Number(m[2]) * unit] as [string, number]);
	brandSizes = {
		text: read(/(--ds-text-(?:display-xl|display|h[1-5]|body-lg|body-sm|body|caption)):\s*([\d.]+)rem;/g, 16),
		space: read(/(--ds-space-[\d-]+):\s*([\d.]+)px;/g, 1).filter(([, v]) => v > 0),
		radius: read(/(--ds-radius-(?:sm|control-sm|control|card|shell)):\s*([\d.]+)px;/g, 1),
		duration: read(/(--ds-duration-(?:fast|base|moderate|slow)):\s*([\d.]+)ms;/g, 1),
	};
	return brandSizes;
}

const nearest = (list: [string, number][], px: number) => list.reduce((a, b) => (Math.abs(b[1] - px) < Math.abs(a[1] - px) ? b : a))[0];
const toPx = (n: string, unit: string) => Number(n) * (unit === 'rem' ? 16 : 1);

function mapLengths(value: string, list: [string, number][], { pill = false } = {}) {
	return value.replace(/(-?)(\d*\.?\d+)(px|rem)\b/g, (all, sign: string, n: string, unit: string) => {
		const px = toPx(n, unit);
		if (px === 0) return '0';
		if (pill && px >= 100) return 'var(--ds-radius-pill)';
		const name = nearest(list, px);
		return sign ? `calc(-1 * var(${name}))` : `var(${name})`;
	});
}

export type RebrandStats = { colors: number; fonts: number; type: number; radius: number; spacing: number; motion: number; shadows: number };

/**
 * A drop shadow becomes the brand's soft one: a small lift is the card shadow, a large one the floating shadow. Rings
 * (0 0 0 Npx) and inset lines are borders drawn with a shadow, so they keep their shape with their color mapped.
 */
function mapShadow(value: string) {
	if (/var\(--ds-shadow-|^\s*none\s*$/.test(value)) return undefined;
	const layers = value.split(/,(?![^(]*\))/).map((l) => l.trim());
	// x, y, blur, spread of a layer, with its color taken out.
	const numbers = (l: string) =>
		l.replace(/color-mix\((?:[^()]|\([^()]*\))*\)|var\((?:[^()]|\([^()]*\))*\)|(?:rgba?|hsla?)\([^)]*\)|#[0-9a-f]+/gi, '').trim().split(/\s+/).filter((t) => /^-?\d*\.?\d+(px)?$/.test(t)).map(Number.parseFloat);
	const drops = layers.filter((l) => {
		const [x = 0, y = 0, blur = 0, spread = 0] = numbers(l);
		return !/\binset\b/.test(l) && !(x === 0 && y === 0 && blur === 0 && spread > 0);
	});
	const blurs = drops.map((l) => numbers(l)[2] ?? 0);
	if (!drops.length) return undefined;
	return Math.max(...blurs) > 24 ? 'var(--ds-shadow-floating)' : 'var(--ds-shadow-card)';
}

const SCALED = /^(font-size|border(-[a-z]+)*-radius|padding(-[a-z]+)*|margin(-[a-z]+)*|gap|row-gap|column-gap|transition(-duration|-delay)?|animation(-duration|-delay)?)$/;

/** Site variables in a value, replaced by their own values (through chains and fallbacks); colors are left as vars. */
function resolveSiteVars(value: string, vars: Map<string, string>, depth = 0): string {
	if (depth > 5) return value;
	return value.replace(/var\((--(?!ds-)[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (all, name: string, fallback?: string) => {
		const raw = vars.get(name) ?? fallback?.trim();
		if (!raw || /var\(--ds-|#|rgb|hsl|oklch/.test(raw)) return all;
		return resolveSiteVars(raw, vars, depth + 1);
	});
}

const DARK_CONTEXT = /\.dark\b|\.theme-dark\b|\[data-(?:theme|mode|color-scheme|bs-theme)\s*=\s*["']?dark|prefers-color-scheme\s*:\s*dark/i;
const LIGHT_CONTEXT = /\.light\b|\.theme-light\b|\[data-(?:theme|mode|color-scheme|bs-theme)\s*=\s*["']?light|prefers-color-scheme\s*:\s*light/i;
// A chart's colors, declared as variables (--series-2, --chart-revenue) or set on series classes.
// The dimmed layer behind a dialog or menu.
const SCRIM = /(backdrop|overlay|scrim|modal|lightbox|dimmer|mask)/i;
const SERIES_NAME = /(series|chart|graph|plot|dataset|legend|swatch)/i;

/**
 * Rebrands every declaration in a stylesheet (or a style attribute), keeping every selector and rule. Rules that only
 * apply in the site's other theme (a .dark block, a prefers-color-scheme query) are read against that theme's colors.
 */
export function rebrandCss(css: string, palette: SitePalette, stats: RebrandStats) {
	palette.series ??= new Map();
	// A @font-face names a font the site ships; its descriptors are not styles and cannot take variables.
	return walkCss(css, (decls, ctx) => (ctx.fontFace ? decls : rebrandDecls(decls, themed(palette, ctx.mode), stats, ctx.selector)));
}

type CssContext = { mode?: 'dark' | 'light'; selector: string; fontFace?: boolean };

/** Calls `each` with the declarations of every rule and the rule's context, and joins what it returns back in place. */
function walkCss(css: string, each: (decls: string, ctx: CssContext) => string) {
	let out = '';
	let segStart = 0;
	const stack: CssContext[] = [];
	const current = () => stack[stack.length - 1] ?? { selector: '' };
	const flush = (end: number) => {
		out += each(css.slice(segStart, end), current());
	};
	for (let i = 0; i < css.length; i++) {
		const ch = css[i];
		if (ch === '/' && css[i + 1] === '*') {
			const close = css.indexOf('*/', i + 2);
			i = close < 0 ? css.length : close + 1;
			continue;
		}
		if (ch === '"' || ch === "'") {
			const close = css.indexOf(ch, i + 1);
			i = close < 0 ? css.length : close;
			continue;
		}
		if (ch === '{') {
			// The selector or at-rule is whatever follows the last declaration, rule or block boundary.
			let b = i - 1;
			while (b >= segStart && !';{}'.includes(css[b])) b--;
			flush(b + 1);
			const prelude = css.slice(b + 1, i);
			out += `${prelude}{`;
			const parent = current();
			stack.push({ mode: DARK_CONTEXT.test(prelude) ? 'dark' : LIGHT_CONTEXT.test(prelude) ? 'light' : parent.mode, selector: /^\s*@/.test(prelude) ? parent.selector : prelude.trim(), fontFace: /^\s*@font-face\b/.test(prelude) });
			segStart = i + 1;
		} else if (ch === '}') {
			flush(i);
			out += '}';
			stack.pop();
			segStart = i + 1;
		}
	}
	flush(css.length);
	return out;
}

/**
 * What each site variable is used for (text, a border, a background) and in which theme, from the rules that use it,
 * since names like --15-light or --gray-2 say nothing. A variable used only by dark-theme rules is a dark color.
 */
function variableUse(css: string) {
	const counts = new Map<string, Record<Family, number>>();
	const themes = new Map<string, { dark: number; light: number }>();
	const defs: [string, string, 'dark' | 'light' | undefined][] = [];
	const add = (name: string, family: Family, mode?: 'dark' | 'light') => {
		const c = counts.get(name) ?? { text: 0, border: 0, surface: 0 };
		c[family]++;
		counts.set(name, c);
		const t = themes.get(name) ?? { dark: 0, light: 0 };
		t[mode === 'dark' ? 'dark' : 'light']++;
		themes.set(name, t);
	};
	walkCss(css, (decls, ctx) => {
		for (const m of decls.matchAll(/(?:^|[{;\s])(--[\w-]+|[a-z-]+)\s*:\s*([^;{}]*var\(--[^;{}]*)/g)) {
			if (m[1].startsWith('--')) {
				defs.push([m[1], m[2], ctx.mode]);
				continue;
			}
			if (/^(transition|animation|font|width|height|margin|padding|gap|top|left|right|bottom|inset|grid|flex|z-index|opacity|transform)/.test(m[1])) continue;
			for (const v of m[2].matchAll(/var\((--(?!ds-)[\w-]+)/g)) add(v[1], familyOf(m[1]), ctx.mode);
		}
		return decls;
	});
	// A variable defined through another (--15-light: var(--dk-text-1)) passes its use on, a few levels deep.
	for (let pass = 0; pass < 3; pass++) {
		for (const [name, value, mode] of defs) {
			const c = counts.get(name);
			const family = c ? (Object.entries(c) as [Family, number][]).sort((x, y) => y[1] - x[1])[0][0] : familyOf(name);
			for (const v of value.matchAll(/var\((--(?!ds-)[\w-]+)/g)) if (pass === 0 || !counts.has(v[1])) add(v[1], family, mode);
		}
	}
	const usage = new Map([...counts].map(([name, c]) => [name, (Object.entries(c) as [Family, number][]).sort((a, b) => b[1] - a[1])[0][0]]));
	const modes = new Map<string, 'dark' | 'light'>();
	for (const [name, t] of themes) if (t.dark && !t.light) modes.set(name, 'dark');
	for (const name of counts.keys()) if (!modes.has(name) && /(^--|-)(dk|dark)(-|$)/.test(name)) modes.set(name, 'dark');
	return { usage, modes };
}

/** Rebrands the declarations of one rule. Custom properties map by their name; the brand's own vars are left. */
function rebrandDecls(css: string, palette: SitePalette, stats: RebrandStats, selector: string) {
	const bgValue = css.match(/(?:^|[;{\s])background(?:-color)?\s*:\s*([^;}]+)/)?.[1];
	const background = bgValue?.match(COLOR_IN_VALUE)?.map((c) => parseColor(c)).find(Boolean);
	return css.replace(/(^|[{;\s])(--[\w-]+|[a-z-]+)(\s*:\s*)([^;{}]+?)(\s*)(?=;|\}|$)/gm, (all, lead: string, prop: string, sep: string, value: string, trail: string) => {
		if (prop.startsWith('--ds-') || /^(src|content|grid-template|grid-area|font-feature|unicode-range|size-adjust|ascent|descent|line-gap)/.test(prop) || /url\(/.test(value) && !/gradient/.test(value)) return all;
		const p = prop.toLowerCase();
		const isVar = p.startsWith('--');
		const pal = isVar && palette.modes?.get(p) ? themed(palette, palette.modes.get(p)) : palette;
		// A size the site keeps in its own scale (font-size: var(--fs-main), border-radius: var(--radius-md)) is read
		// through to its value, so the declaration lands on the brand's scale directly.
		let next = !isVar && SCALED.test(p) && palette.vars ? resolveSiteVars(value, palette.vars) : value;
		if (!/var\(--ds-/.test(next) || /,/.test(next)) {
			const series = SERIES_NAME.test(isVar ? p : selector) ? (isVar ? p : selector) : undefined;
			const replaced = next.replace(COLOR_IN_VALUE, (c) => {
				const rgba = parseColor(c);
				if (!rgba) return c;
				stats.colors++;
				const family = (isVar && palette.usage?.get(p)) || familyOf(prop);
				if (family === 'surface' && rgba[3] >= 0.3 && rgba[3] < 0.995 && hsl(rgba).l < 0.2 && SCRIM.test(selector)) return 'var(--ds-color-bg-scrim)';
				const on = isVar ? undefined : onColor(rgba, family, background, pal);
				return on ? cssColor(on) : mapColor(rgba, family, pal, series);
			});
			next = replaced;
		}
		if ((p === 'box-shadow' || (isVar && /shadow/.test(p))) && /px/.test(next)) {
			const shadow = mapShadow(next);
			if (shadow) {
				stats.shadows++;
				next = shadow;
			}
		}
		const fontStack = /^(font-family|font)$/.test(p) || (isVar && /(font|family|typeface)/.test(p) && /["',]|serif|sans|mono/.test(next));
		if (fontStack && !/var\(--ds-font/.test(next) && p !== 'font') {
			stats.fonts++;
			next = /mono|code|courier|consolas|menlo/i.test(next) ? 'var(--ds-font-mono)' : 'var(--ds-font-sans)';
		} else if (p === 'font-weight' && /^(\d{3}|bold|bolder|semibold|normal|lighter)$/.test(next.trim())) {
			stats.type++;
			next = /^(bold|bolder|semibold)$/.test(next) || Number(next) >= 500 ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-regular)';
		} else if (p === 'letter-spacing' && !/^(0|normal|0em|0px|inherit)$/.test(next.trim())) {
			stats.type++;
			next = 'normal';
		} else if (p === 'font-size' && /\d(px|rem)/.test(next)) {
			stats.type++;
			// A fluid size (clamp, min, max, vw) stays fluid with each end on the brand scale, so headlines still shrink
			// on phones; a fixed size takes the nearest step.
			next = /clamp\(|min\(|max\(|v[wh]\b|calc\(/.test(next) ? next.replace(/(\d*\.?\d+)(px|rem)\b/g, (all, n: string, unit: string) => `var(${nearest(scales().text, toPx(n, unit))})`) : `var(${nearest(scales().text, Math.max(...[...next.matchAll(/(\d*\.?\d+)(px|rem)/g)].map((m) => toPx(m[1], m[2]))))})`;
		} else if (/^border(-[a-z]+)*-radius$/.test(p) && /\d(px|rem)/.test(next)) {
			stats.radius++;
			next = mapLengths(next, scales().radius, { pill: true });
		} else if (/^border(-[a-z]+)*-radius$/.test(p) && /^\s*50%\s*$/.test(next)) {
			stats.radius++;
			next = 'var(--ds-radius-pill)';
		} else if (/^(padding|margin|gap|row-gap|column-gap)(-[a-z]+)*$/.test(p) && /\d(px|rem)/.test(next) && !/calc|clamp|min\(|max\(/.test(next)) {
			stats.spacing++;
			next = mapLengths(next, scales().space);
		} else if (/^(transition|animation)(-duration|-timing-function|-delay)?$/.test(p)) {
			const before = next;
			next = next
				.replace(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g, (all, n: string, unit: string) => `var(${nearest(scales().duration, Number(n) * (unit === 's' ? 1000 : 1))})`)
				.replace(/\bcubic-bezier\([^)]*\)|\bease-in-out\b|\bease-in\b|\bease-out\b|(?<![\w-])ease(?![\w-])/g, (e) => (e === 'ease-in-out' ? 'var(--ds-easing-in-out)' : 'var(--ds-easing-out)'))
				.replace(/(?<![\w-])all(?![\w-])/g, 'color, background-color, border-color, box-shadow, opacity, transform');
			if (next !== before) stats.motion++;
		}
		return next === value ? all : `${lead}${prop}${sep}${next}${trail}`;
	});
}

/** The CSS inside a markup file: <style> blocks and style attributes, rebranded in place. */
export function rebrandMarkup(text: string, palette: SitePalette, stats: RebrandStats) {
	return text
		.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (all, open: string, css: string, close: string) => `${open}${rebrandCss(css, palette, stats)}${close}`)
		.replace(/(\sstyle\s*=\s*)(["'])([^"']*)\2/gi, (all, head: string, q: string, css: string) => `${head}${q}${rebrandCss(css, palette, stats)}${q}`)
		.replace(/(\s(?:fill|stroke|stop-color|color)\s*=\s*)(["'])([^"']+)\2/gi, (all, head: string, q: string, value: string) => {
			const rgba = parseColor(value);
			if (!rgba) return all;
			stats.colors++;
			return `${head}${q}${mapColor(rgba, 'text', palette)}${q}`;
		});
}

let tokenHex: Map<string, string> | undefined;
/** A brand color's literal value, for files that cannot read CSS variables (an SVG shown through <img>). */
export function brandHex(name: string) {
	tokenHex ??= new Map([...readFileSync(pkgPath('build', 'tokens.css'), 'utf8').split(/\n\}/)[0].matchAll(/--ds-color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]));
	return tokenHex.get(name);
}

/**
 * A one-color mark (a logo, an icon) drawn light for a dark site, redrawn in brand text so it shows on the brand's
 * white page. Anything with real color in it is an illustration and stays as drawn.
 */
export function rebrandSvgAsset(svg: string, palette: SitePalette) {
	if (palette.mode !== 'dark') return svg;
	const colors = [...svg.matchAll(COLOR_IN_VALUE)].map((m) => parseColor(m[0])).filter((c): c is RGBA => !!c);
	if (!colors.length || colors.some((c) => hsl(c).s > 0.15 || (c[3] > 0 && hsl(c).l < 0.6))) return svg;
	const ink = brandHex('text-default') ?? '#000000';
	return svg.replace(COLOR_IN_VALUE, (c) => {
		const rgba = parseColor(c);
		return rgba && rgba[3] < 0.995 ? `${ink}${Math.round(rgba[3] * 255).toString(16).padStart(2, '0')}` : ink;
	});
}

// Tailwind's built-in palette, close enough to place each class by role: the hue and saturation of each family and the
// lightness of each shade (grays run darker at the deep end than the colors do).
const TW_HUES: Record<string, [number, number]> = {
	slate: [215, 0.2], gray: [220, 0.12], zinc: [240, 0.05], neutral: [0, 0], stone: [25, 0.06],
	red: [0, 0.84], orange: [25, 0.95], amber: [38, 0.92], yellow: [48, 0.96], lime: [84, 0.81], green: [142, 0.71], emerald: [160, 0.84], teal: [173, 0.8], cyan: [189, 0.94], sky: [199, 0.89], blue: [217, 0.91], indigo: [239, 0.84], violet: [258, 0.9], purple: [271, 0.91], fuchsia: [292, 0.84], pink: [330, 0.81], rose: [350, 0.89],
};
const TW_GRAY_L: Record<string, number> = { 50: 0.98, 100: 0.96, 200: 0.91, 300: 0.84, 400: 0.65, 500: 0.46, 600: 0.34, 700: 0.27, 800: 0.17, 900: 0.11, 950: 0.05 };
const TW_COLOR_L: Record<string, number> = { 50: 0.97, 100: 0.94, 200: 0.88, 300: 0.8, 400: 0.68, 500: 0.57, 600: 0.48, 700: 0.4, 800: 0.32, 900: 0.25, 950: 0.15 };

export function tailwindColor(name: string): RGBA | undefined {
	if (name === 'white') return [255, 255, 255, 1];
	if (name === 'black') return [0, 0, 0, 1];
	const m = name.match(/^([a-z]+)-(50|[1-9]00|950)$/);
	const hue = m && TW_HUES[m[1]];
	if (!hue) return undefined;
	const l = (hue[1] < 0.25 ? TW_GRAY_L : TW_COLOR_L)[m[2]];
	return fromHsl(hue[0], hue[1], l);
}

const TW_FAMILY: [RegExp, Family][] = [
	[/^(bg|from|via|to)$/, 'surface'],
	[/^(text|placeholder|caret|decoration|fill|stroke|accent)$/, 'text'],
	[/^(border(-[xytrblse])?|ring|ring-offset|outline|divide)$/, 'border'],
];

let themeNames: Map<string, string> | undefined;
/** The theme's class name for each brand color token (bg-default is `surface`, text-default is `fg`). */
function themeClass(tokenName: string) {
	if (!themeNames) {
		themeNames = new Map([...readFileSync(pkgPath('build', 'theme.css'), 'utf8').matchAll(/--color-([a-z0-9-]+):\s*var\(--ds-color-([a-z0-9-]+)\)/g)].reverse().map((m) => [m[2], m[1]]));
		// A token the theme names only through an alias (bg-brand is var(--ds-color-brand)) takes the alias's class.
		for (const m of readFileSync(pkgPath('build', 'tokens.css'), 'utf8').split(/\n\}/)[0].matchAll(/--ds-color-([a-z0-9-]+):\s*var\(--ds-color-([a-z0-9-]+)\)/g)) if (!themeNames.has(m[2]) && themeNames.has(m[1])) themeNames.set(m[2], themeNames.get(m[1])!);
	}
	return themeNames.get(tokenName);
}

/**
 * Tailwind color classes (palette, white and black, arbitrary hex) as brand classes: the theme's names when the brand
 * theme is loaded, else arbitrary values that read the brand variables. Variants and opacity modifiers are kept.
 */
export function rebrandClasses(value: string, palette: SitePalette, stats: RebrandStats, theme: boolean) {
	const bgClass = value.match(/(?:^|\s)bg-((?:[a-z]+-(?:50|[1-9]00|950))|\[#[0-9a-fA-F]{3,8}\])(?![\w-])/)?.[1];
	const background = bgClass ? (bgClass.startsWith('[') ? parseColor(bgClass.slice(1, -1)) : tailwindColor(bgClass)) : undefined;
	return value.replace(/(?<![\w-])((?:[\w-]+:|\[[^\]\s]+\]:)*)(!?)(-?)(bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|divide|fill|stroke|from|via|to|decoration|placeholder|caret|accent)-((?:[a-z]+-(?:50|[1-9]00|950))|white|black|\[#[0-9a-fA-F]{3,8}\])(?:\/(\d{1,3}|\[[\d.]+%?\]))?(?![\w-])/g, (all, variants: string, bang: string, neg: string, prefix: string, color: string, opacity?: string) => {
		const rgba = color.startsWith('[') ? parseColor(color.slice(1, -1)) : tailwindColor(color);
		if (!rgba || neg) return all;
		const family = TW_FAMILY.find(([re]) => re.test(prefix))?.[1] ?? 'surface';
		// dark: classes are the site's own dark theme, read against dark colors.
		const mapped = onColor(rgba, family, variants ? undefined : background, palette) ?? colorToken(rgba, family, /(^|:)dark:/.test(variants) ? themed(palette, 'dark') : palette);
		stats.colors++;
		if (mapped === 'transparent') return `${variants}${bang}${prefix}-transparent`;
		const name = theme ? themeClass(mapped.name) : undefined;
		const alpha = opacity ? undefined : mapped.alpha < 0.995 ? Math.round(mapped.alpha * 100) : undefined;
		const mod = opacity ? `/${opacity}` : alpha !== undefined ? `/${alpha}` : '';
		return `${variants}${bang}${prefix}-${name ?? `[var(--ds-color-${mapped.name})]`}${mod}`;
	});
}

const CSS_PROPS_CAMEL = /^(color|background|backgroundColor|backgroundImage|border|border(Top|Right|Bottom|Left|Inline|Block)?(Color)?|outline(Color)?|fill|stroke|boxShadow|textShadow|caretColor|accentColor|textDecorationColor|fontFamily|fontWeight|letterSpacing|borderRadius|border(Top|Bottom)(Left|Right)Radius|transition|animation)$/;
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * A script file (JS, TS, JSX): inline style objects and CSS-in-JS templates get the brand tokens, Tailwind color
 * classes in strings get brand classes, and any other color in the code (a chart library's config, which cannot read
 * CSS variables) gets the brand's literal value. Text, logic and markup stay as written.
 */
export function rebrandScript(text: string, palette: SitePalette, stats: RebrandStats, opts: { tailwind?: 'theme' | 'arbitrary'; hex: (t: ColorToken | 'transparent') => string }) {
	palette.series ??= new Map();
	let next = text
		// styled.div`...`, css`...`, createGlobalStyle`...`, keyframes`...`
		.replace(/(\b(?:styled(?:\.\w+|\([^)]*\))(?:\.attrs\([^)]*\))?|css|createGlobalStyle|keyframes|injectGlobal)\s*`)([^`]*)`/g, (all, head: string, body: string) => `${head}${rebrandCss(body, palette, stats)}\``)
		// style={{ color: '#fff', fontFamily: 'Inter' }} and other objects keyed by CSS properties
		.replace(/(\b|["'])([a-zA-Z]+)\1(\s*:\s*)(["'`])([^"'`\n]+)\4/g, (all, q: string, key: string, sep: string, quote: string, value: string) => {
			if (!CSS_PROPS_CAMEL.test(key)) return all;
			const decl = rebrandCss(`${kebab(key)}: ${value}`, palette, stats);
			const out = decl.slice(decl.indexOf(':') + 1).trim();
			return out === value ? all : `${q}${key}${q}${sep}${quote}${out}${quote}`;
		});
	// style={{ marginTop: 16, gap: 6 }}: React reads bare numbers as pixels.
	next = next.replace(/(\b(?:margin|padding)(?:Top|Right|Bottom|Left|Inline|Block)?|\b(?:row|column)?[gG]ap)(\s*:\s*)(\d+(?:\.\d+)?)(?=\s*[,}\n])/g, (all, key: string, sep: string, n: string) => {
		if (Number(n) === 0) return all;
		stats.spacing++;
		return `${key}${sep}'var(${nearest(scales().space, Number(n))})'`;
	});
	if (opts.tailwind) next = next.replace(/(["'`])((?:(?!\1)[^\n\\])*)\1/g, (all, q: string, body: string) => (/(?:^|\s|:)(?:bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|placeholder|caret|accent)-/.test(body) ? `${q}${rebrandClasses(body, palette, stats, opts.tailwind === 'theme')}${q}` : all));
	return rebrandLiterals(next, palette, stats, opts.hex);
}

const LITERAL = /(["'`])(#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?|#[0-9a-fA-F]{3,4}|(?:rgba?|hsla?)\([^()"'`]*\))\1/g;
const COLORISH_LINE = /(colou?r|bg|background|fill|stroke|border|fg|foreground|tint|accent|palette|theme|series|stops?)/i;

/** The family a literal's line suggests: a background, a border, else text. */
const lineFamily = (line: string): Family => (/(bg|background|surface|fill|canvas|card|panel)/i.test(line) ? 'surface' : /(border|stroke|line|divider|outline|ring)/i.test(line) ? 'border' : 'text');

/**
 * Color strings in any language ('#1a1a1a' in Python, "rgb(0 0 0)" in Go, a theme JSON) become the brand's literal
 * value for the same role, written in the same form. Three-digit hex only on lines that talk about color, since
 * strings like '#add' or '#fed' are often not colors. A run of strong colors in one array is a chart's series.
 */
export function rebrandLiterals(text: string, palette: SitePalette, stats: RebrandStats, hex: (t: ColorToken | 'transparent') => string) {
	palette.series ??= new Map();
	const lines = text.split('\n');
	return lines
		.map((line, index) => {
			const strong = [...line.matchAll(LITERAL)].filter((m) => {
				const c = parseColor(m[2]);
				return c && hsl(c).s > 0.3 && hsl(c).l > 0.12 && hsl(c).l < 0.88;
			}).length;
			const seriesKey = strong >= 2 && /\[|\(/.test(line) ? `line:${index}` : /(series|chart|dataset|graph|plot)/i.test(line) ? `line:${index}` : undefined;
			let n = 0;
			return line.replace(LITERAL, (all, q: string, value: string) => {
				if (/^#[0-9a-f]{3,4}$/i.test(value) && !COLORISH_LINE.test(line)) return all;
				const rgba = parseColor(value);
				if (!rgba) return all;
				stats.colors++;
				const mapped = colorToken(rgba, lineFamily(line), palette, seriesKey ? `${seriesKey}:${n++}` : undefined);
				return `${q}${hex(mapped)}${q}`;
			});
		})
		.join('\n');
}

let modeHex: Map<string, Map<string, string>> | undefined;
/** A brand color's literal value in a theme: the site's (`root`), the product's, or the product's dark one. */
export function brandLiteral(t: ColorToken | 'transparent', theme: 'root' | 'product' | 'product-dark' = 'root', form: 'hex' | 'argb' = 'hex') {
	if (!modeHex) {
		const css = readFileSync(pkgPath('build', 'tokens.css'), 'utf8');
		const read = (block: string) => new Map([...block.matchAll(/--ds-color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]));
		const root = read(css.split(/\n\}/)[0]);
		const product = new Map([...root, ...read(css.match(/\n\.ds-product \{([^}]*)\}/)?.[1] ?? '')]);
		const dark = new Map([...product, ...read(css.match(/\n\.ds-product\[data-theme="dark"\],[^{]*\{([^}]*)\}/)?.[1] ?? '')]);
		// Semantic names that point at another token (bg-brand: var(--ds-color-brand)) resolve through it.
		for (const map of [root, product, dark]) for (const m of css.split(/\n\}/)[0].matchAll(/--ds-color-([a-z0-9-]+):\s*var\(--ds-color-([a-z0-9-]+)\)/g)) if (!map.has(m[1]) && map.has(m[2])) map.set(m[1], map.get(m[2])!);
		modeHex = new Map([['root', root], ['product', product], ['product-dark', dark]]);
	}
	if (t === 'transparent') return form === 'argb' ? '00000000' : '#00000000';
	const value = modeHex.get(theme)?.get(t.name) ?? modeHex.get('root')?.get(t.name) ?? '#000000';
	const alpha = Math.round(t.alpha * 255).toString(16).padStart(2, '0').toUpperCase();
	if (form === 'argb') return `${alpha}${value.slice(1)}`;
	return t.alpha >= 0.995 ? value : `${value}${alpha}`;
}

const NATIVE_COLOR = [
	// Compose, Flutter, Android: Color(0xFF1A1A1A)
	{ re: /\bColor\(\s*0x([0-9a-fA-F]{8})\s*\)/g, read: (m: RegExpMatchArray) => parseColor(`#${m[1].slice(2)}${m[1].slice(0, 2)}`), write: (argb: string) => `Color(0x${argb})` },
	// SwiftUI and UIKit: Color(red: 0.1, green: 0.1, blue: 0.1[, opacity: 1])
	{ re: /\b(Color|UIColor|NSColor)\(\s*(?:\.sRGB,\s*)?red:\s*([\d.]+)\s*(?:\/\s*255(?:\.0)?)?,\s*green:\s*([\d.]+)\s*(?:\/\s*255(?:\.0)?)?,\s*blue:\s*([\d.]+)\s*(?:\/\s*255(?:\.0)?)?(?:,\s*(?:opacity|alpha):\s*([\d.]+))?\s*\)/g, read: (m: RegExpMatchArray) => { const scale = /\/\s*255/.test(m[0]) || [m[2], m[3], m[4]].some((v) => Number(v) > 1) ? 1 : 255; return [Number(m[2]) * scale, Number(m[3]) * scale, Number(m[4]) * scale, m[5] === undefined ? 1 : Number(m[5])] as RGBA; }, write: (argb: string, m: RegExpMatchArray) => { const [a, r, g, b] = [0, 2, 4, 6].map((i) => Math.round((Number.parseInt(argb.slice(i, i + 2), 16) / 255) * 1000) / 1000); return `${m[1]}(red: ${r}, green: ${g}, blue: ${b}${a < 1 ? `, ${m[1] === 'Color' ? 'opacity' : 'alpha'}: ${a}` : m[5] !== undefined ? `, ${m[1] === 'Color' ? 'opacity' : 'alpha'}: 1` : ''})`; } },
];

/**
 * Native and other UI code (Swift, Kotlin, Dart, Android XML, C#, Python, anything with color strings): each color
 * becomes the brand's value for its role, in the language's own color form, so the file needs no new imports.
 */
export function rebrandNative(text: string, palette: SitePalette, stats: RebrandStats, theme: 'root' | 'product' | 'product-dark', xml = false) {
	palette.series ??= new Map();
	const lineAt = (src: string, offset: number) => src.slice(src.lastIndexOf('\n', offset) + 1, (src.indexOf('\n', offset) + 1 || src.length + 1) - 1);
	let next = text;
	for (const kind of NATIVE_COLOR) {
		const src = next;
		next = src.replace(kind.re, (...args) => {
			const offset = args[args.length - 2] as number;
			const m = args.slice(0, -2) as unknown as RegExpMatchArray;
			const rgba = kind.read(m);
			if (!rgba) return args[0];
			stats.colors++;
			return kind.write(brandLiteral(colorToken(rgba, lineFamily(lineAt(src, offset)), palette), theme, 'argb'), m);
		});
	}
	if (!xml) return rebrandLiterals(next, palette, stats, (t) => brandLiteral(t, theme));
	// Android resources and XAML write alpha first: android:textColor="#80FFFFFF", <color name="bg">#121212</color>
	const src = next;
	return src.replace(/(=\s*"|>\s*)(#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?|#[0-9a-fA-F]{3})(?=\s*["<])/g, (all, head: string, value: string, offset: number) => {
		const rgba = parseColor(value.length === 9 ? `#${value.slice(3)}${value.slice(1, 3)}` : value);
		if (!rgba) return all;
		stats.colors++;
		const argb = brandLiteral(colorToken(rgba, lineFamily(lineAt(src, offset)), palette), theme, 'argb');
		return `${head}#${argb.startsWith('FF') ? argb.slice(2) : argb}`;
	});
}

/**
 * The palette of an app with no stylesheet (SwiftUI, Compose, Flutter, Android): its background and text colors, read
 * from the lines that name them (background, scaffold, surface; text, foreground, label).
 */
export function nativePalette(sources: string[]): SitePalette {
	let bg: RGBA | undefined;
	let fg: RGBA | undefined;
	for (const text of sources) {
		for (const line of text.split('\n')) {
			const isBg = /(background|scaffold|canvas|window|launch|\bbg\b)/i.test(line) && !/on-?background/i.test(line);
			const isFg = /(text|foreground|onBackground|on_background|label|\bfg\b|ink)/i.test(line);
			if (!isBg && !isFg) continue;
			let color: RGBA | undefined;
			for (const kind of NATIVE_COLOR) for (const m of line.matchAll(kind.re)) color ??= kind.read(m);
			color ??= [...line.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => parseColor(m[0])).find(Boolean);
			if (!color) continue;
			if (isBg && !bg) bg = color;
			else if (isFg && !isBg && !fg) fg = color;
		}
	}
	const lbg = bg ? hsl(bg).l : 1;
	const lfg = fg ? hsl(fg).l : lbg > 0.5 ? 0 : 1;
	return { mode: lbg < 0.4 ? 'dark' : 'light', bg: lbg, fg: Math.abs(lfg - lbg) < 0.2 ? 1 - lbg : lfg, found: !!bg };
}

/**
 * The palette a file's Tailwind classes set for itself: the first background and text color on its outermost
 * elements (no variants). A page drawn dark with bg-zinc-950 is a dark page even when the project's stylesheet is light.
 */
export function classPalette(text: string, base: SitePalette): SitePalette {
	const color = (prefix: string) => {
		const m = text.match(new RegExp(`(?<![\\w:-])${prefix}-((?:[a-z]+-(?:50|[1-9]00|950))|white|black|\\[#[0-9a-fA-F]{3,8}\\])(?![\\w-])`));
		return m ? (m[1].startsWith('[') ? parseColor(m[1].slice(1, -1)) : tailwindColor(m[1])) : undefined;
	};
	const bg = color('bg');
	if (!bg) return base;
	const fg = color('text');
	const lbg = hsl(bg).l;
	const lfg = fg ? hsl(fg).l : lbg > 0.5 ? 0 : 1;
	return { ...base, mode: lbg < 0.4 ? 'dark' : 'light', bg: lbg, fg: Math.abs(lfg - lbg) < 0.2 ? 1 - lbg : lfg };
}
