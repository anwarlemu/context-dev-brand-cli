import { contrastRatio } from '../../lib/color.js';
import type { Rule } from '../context.js';
import type { Node } from '../source.js';
import type { RawFinding } from '../types.js';
import { parseClass } from '../vocab.js';

const ALIAS_TO_SEMANTIC: Record<string, string> = {
	surface: 'bg.default', 'surface-subtle': 'bg.subtle', 'surface-inverse': 'bg.inverse', tint: 'bg.tint', brand: 'bg.brand',
	fg: 'text.default', 'fg-muted': 'text.muted', 'fg-subtle': 'text.subtle', 'fg-inverse': 'text.inverse', 'on-brand': 'text.on-brand',
	action: 'action.primary', 'action-hover': 'action.primary-hover', 'on-action': 'action.primary-fg', success: 'status.success', warning: 'status.warning', danger: 'status.danger',
};

function classesOf(ctxFile: { classTokens: { value: string; element?: Node }[] }, element: Node) {
	return ctxFile.classTokens.filter((t) => t.element === element).map((t) => parseClass(t.value)).filter((c) => !c.variants);
}

export const contrast: Rule = {
	id: 'contrast',
	description: 'Text and background token pairs meet WCAG AA, using the token contrast matrix.',
	run({ file, vocab }) {
		const out: RawFinding[] = [];
		const allowed = new Map(vocab.pairs.map((p) => [`${p.fg}|${p.bg}`, p.min]));
		const textColor = (cls: ReturnType<typeof parseClass>[]) => cls.map((c) => c.utility.match(/^text-([a-z0-9-]+)(?:\/(\d+))?$/)).find((m) => m && vocab.colorHex.has(m[1]) && !m[2])?.[1];
		const bgColor = (cls: ReturnType<typeof parseClass>[]) => cls.map((c) => c.utility.match(/^bg-([a-z0-9-]+)(?:\/(\d+))?$/)).find((m) => m && vocab.colorHex.has(m[1]) && !m[2])?.[1];
		const isLarge = (cls: ReturnType<typeof parseClass>[]) => cls.some((c) => { const m = c.utility.match(/^text-([a-z0-9-]+)$/); return !!m && vocab.largeTextSizes.has(m[1]); });
		for (const el of file.jsxElements) {
			const own = classesOf(file, el);
			const fg = textColor(own);
			if (!fg) continue;
			let bg = bgColor(own);
			let parent = file.parents.get(el);
			while (!bg && parent) {
				if (parent.type === 'JSXElement') bg = bgColor(classesOf(file, parent));
				parent = file.parents.get(parent);
			}
			if (!bg) continue;
			const fgHex = vocab.colorHex.get(fg)!;
			const bgHex = vocab.colorHex.get(bg)!;
			const ratio = contrastRatio(fgHex, bgHex);
			const large = isLarge(own);
			const listedMin = ALIAS_TO_SEMANTIC[fg] && ALIAS_TO_SEMANTIC[bg] ? allowed.get(`${ALIAS_TO_SEMANTIC[fg]}|${ALIAS_TO_SEMANTIC[bg]}`) : undefined;
			const required = listedMin ?? (large ? 3 : 4.5);
			if (listedMin !== undefined && listedMin < 4.5 && !large) {
				out.push({ rule: 'contrast', message: `text-${fg} on bg-${bg} is ${ratio.toFixed(2)}:1, allowed for large text only`, hint: 'Use a heading size (text-h4 or larger) or text-fg / text-fg-muted', offset: el.start });
			} else if (ratio < required) {
				out.push({ rule: 'contrast', message: `text-${fg} on bg-${bg} is ${ratio.toFixed(2)}:1, needs ${required}:1`, hint: 'Pick a pair from build/contrast-report.md', offset: el.start });
			}
		}
		return out;
	},
};
