import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';

export type Vocab = {
	colors: Set<string>;
	colorHex: Map<string, string>;
	hexToClass: Map<string, string>;
	hexToVar: Map<string, string>;
	textSizes: Set<string>;
	largeTextSizes: Set<string>;
	fontFamilies: Set<string>;
	fontWeights: Set<string>;
	radii: Set<string>;
	easings: Set<string>;
	durations: Set<string>;
	spacing: Map<string, number>;
	pairs: { fg: string; bg: string; min: number }[];
};

let cached: Vocab | undefined;

export function loadVocab(): Vocab {
	if (cached) return cached;
	const theme = readFileSync(pkgPath('build', 'theme.css'), 'utf8');
	const tokensCss = readFileSync(pkgPath('build', 'tokens.css'), 'utf8');
	const vars = new Map<string, string>();
	for (const m of tokensCss.matchAll(/(--ds-[a-z0-9-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
	const names = (prefix: string) => [...theme.matchAll(new RegExp(`--${prefix}-([a-z0-9-]+?)(?:--[a-z-]+)?:\\s*([^;]+);`, 'g'))].filter((m) => m[1] !== '*').map((m) => [m[1], m[2].trim()] as const);

	const colorHex = new Map<string, string>();
	const hexToClass = new Map<string, string>();
	for (const [name, value] of names('color')) {
		const varName = value.match(/var\((--ds-[^)]+)\)/)?.[1];
		const hex = varName ? vars.get(varName) : undefined;
		if (!hex) continue;
		colorHex.set(name, hex.toUpperCase());
		const current = hexToClass.get(hex.toUpperCase());
		if (!current || name.length < current.length || /^(black|white|brand)$/.test(name)) hexToClass.set(hex.toUpperCase(), name);
	}
	const hexToVar = new Map<string, string>();
	for (const [varName, value] of vars) {
		if (!/^#[0-9a-f]{6}$/i.test(value) || !varName.startsWith('--ds-color-')) continue;
		const key = value.toUpperCase();
		const current = hexToVar.get(key);
		const semantic = /--ds-color-(bg|text|border|action|status|focus)-/.test(varName);
		if (!current || (semantic && !/--ds-color-(bg|text|border|action|status|focus)-/.test(current))) hexToVar.set(key, varName);
	}
	const textSizes = new Set([...theme.matchAll(/--text-([a-z0-9-]+?):\s/g)].map((m) => m[1]).filter((n) => n !== '*' && !n.includes('--')));
	const spacing = new Map<string, number>();
	for (const [varName, value] of vars) {
		const m = varName.match(/^--ds-space-(.+)$/);
		if (m) spacing.set(m[1].replace('-', '.'), parseFloat(value));
	}
	const pairsFile = JSON.parse(readFileSync(pkgPath('tokens', 'contrast-pairs.json'), 'utf8')) as { pairs: { fg: string; bg: string; min: number }[] };
	cached = {
		colors: new Set([...colorHex.keys(), 'transparent', 'current', 'inherit', 'currentColor']),
		colorHex,
		hexToClass,
		hexToVar,
		textSizes,
		largeTextSizes: new Set(['display-xl', 'display', 'h1', 'h2', 'h3', 'h4', 'stat']),
		fontFamilies: new Set(names('font').filter(([n]) => !n.startsWith('weight')).map(([n]) => n)),
		fontWeights: new Set([...theme.matchAll(/--font-weight-([a-z]+):/g)].map((m) => m[1])),
		radii: new Set(names('radius').map(([n]) => n)),
		easings: new Set([...names('ease').map(([n]) => n), 'linear']),
		durations: new Set(['0', ...[...vars].filter(([k]) => k.startsWith('--ds-duration-')).map(([, v]) => String(parseFloat(v)))]),
		spacing,
		pairs: pairsFile.pairs,
	};
	return cached;
}

export const TAILWIND_PALETTE = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'mauve', 'olive', 'mist', 'taupe']);
export const TAILWIND_TEXT_SIZES = new Set(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']);
export const TAILWIND_WEIGHTS = new Set(['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black']);

export const CSS_NAMED_COLORS = new Set('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' '));

export const RAW_COLOR_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/g;

export function expandHex(hex: string) {
	let h = hex.replace('#', '');
	if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
	return `#${h.slice(0, 6).toUpperCase()}`;
}

export type ParsedClass = { variants: string; negative: boolean; important: boolean; utility: string; arbitrary?: string };

export function parseClass(token: string): ParsedClass {
	let rest = token.replace(/[,'"`]+$/, '');
	let variants = '';
	let depth = 0;
	let lastColon = -1;
	for (let i = 0; i < rest.length; i++) {
		if (rest[i] === '[') depth++;
		else if (rest[i] === ']') depth--;
		else if (rest[i] === ':' && depth === 0) lastColon = i;
	}
	if (lastColon >= 0) {
		variants = rest.slice(0, lastColon + 1);
		rest = rest.slice(lastColon + 1);
	}
	const important = rest.startsWith('!') || rest.endsWith('!');
	rest = rest.replace(/^!|!$/g, '');
	const negative = rest.startsWith('-');
	if (negative) rest = rest.slice(1);
	const arbitrary = rest.match(/\[(.*)\]$/)?.[1] ?? rest.match(/\((--.*)\)$/)?.[1];
	return { variants, negative, important, utility: rest, arbitrary };
}

export const SPACING_PREFIXES = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me', 'gap', 'gap-x', 'gap-y', 'space-x', 'space-y', 'inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end', 'scroll-m', 'scroll-p'];
export const COLOR_PREFIXES = ['bg', 'text', 'border', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l', 'ring', 'ring-offset', 'outline', 'fill', 'stroke', 'from', 'via', 'to', 'decoration', 'divide', 'placeholder', 'accent', 'caret', 'shadow', 'inset-shadow', 'inset-ring'];
