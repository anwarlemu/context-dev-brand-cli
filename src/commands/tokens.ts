import type { Command } from 'commander';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { emit } from '../lib/output.js';
import { pkgPath } from '../lib/paths.js';

type Node = { $value?: unknown; $type?: string; $description?: string; [k: string]: unknown };

const CLASS_ALIASES: Record<string, string[]> = {
	'color.bg.default': ['bg-surface'], 'color.bg.subtle': ['bg-surface-subtle'], 'color.bg.inverse': ['bg-surface-inverse'], 'color.bg.tint': ['bg-tint'], 'color.bg.brand': ['bg-brand'],
	'color.text.default': ['text-fg'], 'color.text.muted': ['text-fg-muted'], 'color.text.subtle': ['text-fg-subtle'], 'color.text.inverse': ['text-fg-inverse'], 'color.text.on-brand': ['text-on-brand'], 'color.text.brand': ['text-brand'],
	'color.border.default': ['border-line'], 'color.border.subtle': ['border-line-subtle'], 'color.border.strong': ['border-line-strong'], 'color.border.brand': ['border-brand'], 'color.border.on-brand': ['border-on-brand'],
	'color.action.primary': ['bg-action'], 'color.action.primary-hover': ['hover:bg-action-hover'], 'color.action.primary-fg': ['text-on-action'], 'color.action.secondary': ['text-brand', 'border-brand'],
	'color.status.success': ['text-success'], 'color.status.warning': ['text-warning'], 'color.status.danger': ['text-danger'], 'color.focus.ring': ['outline-focus'],
};

function loadTree(): Node {
	const tree: Node = {};
	const merge = (t: Node, s: Node) => {
		for (const [k, v] of Object.entries(s)) {
			if (v && typeof v === 'object' && !Array.isArray(v) && !('$value' in (v as Node))) merge((t[k] ??= {}) as Node, v as Node);
			else t[k] = v;
		}
	};
	for (const tier of ['primitive', 'semantic', 'component']) for (const f of readdirSync(pkgPath('tokens', tier))) merge(tree, JSON.parse(readFileSync(pkgPath('tokens', tier, f), 'utf8')));
	return tree;
}

function resolve(tree: Node, value: unknown): unknown {
	if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) {
		const node = value.slice(1, -1).split('.').reduce<unknown>((a, p) => (a as Node)?.[p], tree) as Node;
		return resolve(tree, node?.$value);
	}
	if (value && typeof value === 'object' && !Array.isArray(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(tree, v)]));
	return value;
}

export function tokenEntries() {
	const tree = loadTree();
	const out: { path: string; type?: string; value: unknown; ref?: unknown; cssVar: string; classes: string[]; description?: string }[] = [];
	const walk = (node: Node, path: string[]) => {
		if ('$value' in node) {
			const p = path.join('.');
			const classes = CLASS_ALIASES[p] ?? [];
			if (path[0] === 'color' && ['black', 'white', 'blue', 'navy', 'neutral', 'brand'].includes(path[1])) classes.push(`bg-${path.slice(1).join('-')}`, `text-${path.slice(1).join('-')}`);
			if (path[0] === 'text') classes.push(`text-${path[1]}`);
			if (path[0] === 'space') classes.push(`p-${path[1].replace('-', '.')}`, `gap-${path[1].replace('-', '.')}`);
			if (path[0] === 'radius') classes.push(`rounded-${path[1]}`);
			if (path[0] === 'duration') classes.push(`duration-${parseFloat(String(node.$value))}`);
			if (path[0] === 'easing') classes.push(`ease-${path[1]}`);
			if (path[0] === 'font' && path[1] === 'family') classes.push(`font-${path[2]}`);
			if (path[0] === 'font' && path[1] === 'weight') classes.push(`font-${path[2]}`);
			out.push({ path: p, type: node.$type, value: resolve(tree, node.$value), ref: typeof node.$value === 'string' && node.$value.startsWith('{') ? node.$value : undefined, cssVar: `--ds-${path.join('-')}`, classes, description: node.$description });
			return;
		}
		for (const [k, v] of Object.entries(node)) if (!k.startsWith('$') && v && typeof v === 'object') walk(v as Node, [...path, k]);
	};
	walk(tree, []);
	return out;
}

export function registerTokens(program: Command) {
	program
		.command('tokens [path]')
		.description('Look up a token: value, CSS variable, Tailwind class. Or --search a term')
		.option('--search <term>', 'search token paths, values and descriptions')
		.option('--json', 'JSON output')
		.action((path: string | undefined, opts) => {
			const entries = tokenEntries();
			let hits = entries;
			if (path) hits = entries.filter((e) => e.path === path || e.path.startsWith(`${path}.`));
			else if (opts.search) {
				const t = String(opts.search).toLowerCase();
				hits = entries.filter((e) => e.path.includes(t) || JSON.stringify(e.value).toLowerCase().includes(t) || (e.description ?? '').toLowerCase().includes(t) || e.classes.some((c) => c.includes(t)));
			}
			if (!hits.length) throw new Error(`No token matches "${path ?? opts.search}". Try --search.`);
			emit(opts, hits, () => hits.map((e) => `${e.path}  ${typeof e.value === 'object' ? JSON.stringify(e.value) : e.value}${e.ref ? ` (${e.ref})` : ''}  var(${e.cssVar})${e.classes.length ? `  ${e.classes.join(' ')}` : ''}${e.description ? `  # ${e.description}` : ''}`).join('\n'));
		});
}
