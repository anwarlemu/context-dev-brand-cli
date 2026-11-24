import type { ComposeBlock, DesignState } from '../design/index.js';

// Slide types made of the brand's blocks (src/assets/compose.ts) at 1920 by 1080: the agenda, the team (names and roles,
// never photos), a timeline, a chart, a comparison, a grid of pictures in dots, and questions. They keep the share
// images' rules as the other slides do: the logo top left, the headline in the brand sans, dots kept clear of words.

type Built = Pick<DesignState, 'blocks' | 'copy'> & Partial<Pick<DesignState, 'grid'>>;
const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });
const b = (id: string, type: string, a: ComposeBlock['at']): ComposeBlock => ({ id, type, at: a });
const items = (v?: string) => (v ?? '').split('|').map((x) => x.trim()).filter(Boolean);
const words = (pairs: [string, string, string | undefined][]) => Object.fromEntries(pairs.filter(([, , v]) => v?.trim()).map(([id, slot, v]) => [`${id}.${slot}`, v!]));
const head = (s: Record<string, string>) => (s.title?.trim() ? [b('title', 'headline', at(0, 2, 12, 2))] : []);

export const BLOCK_SLIDES: Record<string, (s: Record<string, string>) => Built> = {
	agenda: (s) => ({ blocks: [b('logo', 'logo', at(0, 0, 4, 2)), ...head(s), b('items', 'list', at(0, 4, 8, 8))], copy: words([['title', 'text', s.title], ['items', 'items', s.items]]) }),
	team: (s) => {
		const people = items(s.items).slice(0, 8);
		const cols = people.length > 4 ? 4 : Math.max(1, people.length);
		const w = 12 / cols;
		return {
			blocks: [b('logo', 'logo', at(0, 0, 4, 2)), ...head(s), ...people.map((_, i) => b(`person-${i + 1}`, 'card', at((i % cols) * w, 4 + Math.floor(i / cols) * 4, w, 3)))],
			copy: { ...words([['title', 'text', s.title]]), ...Object.assign({}, ...people.map((p, i) => {
				const [name, ...role] = p.split(',');
				return words([[`person-${i + 1}`, 'heading', name?.trim()], [`person-${i + 1}`, 'text', role.join(',').trim()]]);
			})) },
		};
	},
	timeline: (s) => {
		const steps = items(s.items).slice(0, 6);
		const w = Math.floor(12 / Math.max(1, steps.length));
		return {
			blocks: [b('logo', 'logo', at(0, 0, 4, 2)), ...head(s), b('line', 'divider', at(0, 5, 12, 1)), ...steps.map((_, i) => b(`step-${i + 1}`, 'card', at(i * w, 6, w, 4)))],
			copy: { ...words([['title', 'text', s.title]]), ...Object.assign({}, ...steps.map((p, i) => {
				const [when, ...what] = p.split(' ');
				return { ...words([[`step-${i + 1}`, 'heading', when], [`step-${i + 1}`, 'text', what.join(' ')]]), [`step-${i + 1}.number`]: String(i + 1) };
			})) },
		};
	},
	chart: (s) => ({ blocks: [b('logo', 'logo', at(0, 0, 4, 2)), ...head(s), b('chart', 'chart', at(0, 4, s.body?.trim() ? 8 : 12, 8)), ...(s.body?.trim() ? [b('body', 'body', at(9, 4, 3, 4))] : [])], copy: words([['title', 'text', s.title], ['chart', 'data', s.data], ['body', 'text', s.body]]) }),
	comparison: (s) => ({
		blocks: [b('logo', 'logo', at(0, 0, 4, 2)), ...head(s), b('left-title', 'body', at(0, 4, 5, 1)), b('left', 'list', at(0, 5, 5, 6)), b('right-title', 'body', at(7, 4, 5, 1)), b('right', 'list', at(7, 5, 5, 6))],
		copy: words([['title', 'text', s.title], ['left-title', 'text', s['left-title']], ['left', 'items', s['left-items']], ['right-title', 'text', s['right-title']], ['right', 'items', s['right-items']]]),
	}),
	'image-grid': (s) => {
		const n = Math.min(4, Math.max(2, Number(s.count) || 3));
		const w = 12 / n;
		return { blocks: [b('logo', 'logo', at(0, 0, 4, 2)), ...head(s), ...Array.from({ length: n }, (_, i) => b(`picture-${i + 1}`, 'picture', at(i * w, 4, w, 8)))], copy: words([['title', 'text', s.title]]) };
	},
	qa: (s) => ({ blocks: [b('field', 'field', at(0, 0, 12, 12)), b('logo', 'logo', at(0, 0, 4, 2)), b('title', 'headline', at(1, 4, 10, 3)), ...(s.body?.trim() ? [b('body', 'body', at(2, 7, 8, 1))] : [])], copy: words([['title', 'text', s.title], ['body', 'text', s.body]]), layers: { title: { align: 'center' as const }, ...(s.body?.trim() ? { body: { align: 'center' as const } } : {}) } } as Built),
};
