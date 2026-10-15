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
		const [h, s, l] = [Number(hsl[1]) / 360, Number(hsl[2]) / 100, Number(hsl[3]) / 100];
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		const f = (t: number) => {
			const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
			return 255 * (x < 1 / 6 ? p + (q - p) * 6 * x : x < 1 / 2 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p);
		};
		const a = hsl[4] === undefined ? 1 : hsl[4].endsWith('%') ? Number.parseFloat(hsl[4]) / 100 : Number(hsl[4]);
		return [f(h + 1 / 3), f(h), f(h - 1 / 3), a];
	}
	return undefined;
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

export type SitePalette = { mode: 'dark' | 'light'; bg: number; fg: number };

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
	return { mode: lbg < 0.4 ? 'dark' : 'light', bg: lbg, fg: Math.abs(lfg - lbg) < 0.2 ? 1 - lbg : lfg };
}

type Family = 'text' | 'border' | 'surface';

/** Which kind of color a declaration sets, from the property, or for a custom property from its name. */
export function familyOf(prop: string): Family {
	const p = prop.toLowerCase();
	if (p.startsWith('--')) {
		if (/(border|line|rule|divider|stroke|outline|hairline|separator)/.test(p)) return 'border';
		if (/(bg|background|surface|paper|canvas|base|card|panel|elev|overlay|fill)/.test(p)) return 'surface';
		if (/(ink|text|fg|foreground|copy|heading|title|muted|subtle|faint|label)/.test(p)) return 'text';
		return 'surface';
	}
	if (/^(color|fill|stroke|caret-color|text-decoration-color|-webkit-text-fill-color|column-rule-color)$/.test(p) || p.startsWith('text-')) return p === 'fill' || p === 'stroke' ? 'text' : 'text';
	if (/^(border|outline)/.test(p)) return 'border';
	return 'surface';
}

const token = (name: string, alpha = 1) => (alpha >= 0.995 ? `var(--ds-color-${name})` : `color-mix(in srgb, var(--ds-color-${name}) ${Math.round(alpha * 1000) / 10}%, transparent)`);

/** One color, mapped to the brand token for the role it plays on this site. */
export function mapColor(rgba: RGBA, family: Family, palette: SitePalette): string {
	const { h, s, l } = hsl(rgba);
	const a = rgba[3];
	if (a === 0) return 'transparent';
	if (s > 0.3 && l > 0.12 && l < 0.88) {
		if (h >= 85 && h < 165) return token('status-success', a);
		if (h < 18 || h >= 345) return token('status-danger', a);
		if (h >= 18 && h < 60) return token('status-warning', a);
		return token(family === 'text' ? 'text-brand' : family === 'border' ? 'border-brand' : 'brand', a);
	}
	// How far this neutral sits from the site's background toward its text: 0 is the page, 1 is the main text.
	const t = Math.max(0, Math.min(1, (l - palette.bg) / (palette.fg - palette.bg || 1)));
	if (a < 0.995) return t > 0.5 ? token('text-default', a) : token('black', a);
	if (family === 'text') return t > 0.82 ? token('text-default') : t > 0.55 ? token('text-muted') : t > 0.25 ? token('text-subtle') : token('text-inverse');
	if (family === 'border') return t < 0.12 ? token('border-subtle') : t < 0.32 ? token('border-default') : t < 0.6 ? token('border-strong') : token('text-default');
	return t < 0.035 ? token('bg-default') : t < 0.09 ? token('bg-subtle') : t < 0.2 ? token('bg-frame') : t < 0.45 ? token('border-strong') : t < 0.82 ? token('text-subtle') : token('action-primary');
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

/** Rebrands every declaration in a block of CSS. Custom properties map by their name; the brand's own vars are left. */
export function rebrandCss(css: string, palette: SitePalette, stats: RebrandStats) {
	return css.replace(/(^|[{;\s])(--[\w-]+|[a-z-]+)(\s*:\s*)([^;{}]+?)(\s*)(?=;|\}|$)/gm, (all, lead: string, prop: string, sep: string, value: string, trail: string) => {
		if (prop.startsWith('--ds-') || /^(src|content|grid-template|grid-area|font-feature|unicode-range|size-adjust|ascent|descent|line-gap)/.test(prop) || /url\(/.test(value) && !/gradient/.test(value)) return all;
		let next = value;
		const p = prop.toLowerCase();
		const isVar = p.startsWith('--');
		if (!/var\(--ds-/.test(next) || /,/.test(next)) {
			const replaced = next.replace(COLOR_IN_VALUE, (c) => {
				const rgba = parseColor(c);
				if (!rgba) return c;
				stats.colors++;
				return mapColor(rgba, familyOf(prop), palette);
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
			// A fluid size settles on the brand step nearest its largest value.
			const sizes = [...next.matchAll(/(\d*\.?\d+)(px|rem)/g)].map((m) => toPx(m[1], m[2]));
			next = `var(${nearest(scales().text, Math.max(...sizes))})`;
		} else if (/^border(-[a-z]+)*-radius$/.test(p) && /\d(px|rem)/.test(next)) {
			stats.radius++;
			next = mapLengths(next, scales().radius, { pill: true });
		} else if (/^(padding|margin|gap|row-gap|column-gap)(-[a-z]+)*$/.test(p) && /\d(px|rem)/.test(next) && !/calc|clamp|min\(|max\(/.test(next)) {
			stats.spacing++;
			next = mapLengths(next, scales().space);
		} else if (/^(transition|animation)(-duration|-timing-function)?$/.test(p)) {
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
