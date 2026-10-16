import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, cli } from '../lib/brand.js';
import { color, emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { readState, writeState } from '../plan/state.js';
import { capture } from '../review/capture.js';
import { critique } from '../review/critique.js';

// `review <url>`: screenshots at desktop and phone width, critiqued against the brand's own pages. The result is
// recorded for the screen it belongs to, which is how a task is checked off.

export async function review(target: string | undefined, opts: { json?: boolean; threshold?: string }) {
	const root = findProjectRoot();
	const state = readState(root);
	if (!target || !/^https?:\/\//.test(target)) {
		const hint = state?.baseUrl ? `${state.baseUrl}${target ?? '/'}` : 'http://localhost:<port>/<page>';
		throw new Error(`Start the app and pass the page's URL: \`${cli()} review ${hint}\`.`);
	}
	const url = new URL(target);
	const path = url.pathname.replace(/\/index\.html?$/, '/').replace(/(.)\/$/, '$1') || '/';
	// Match the URL to a screen: its route, or a dynamic route with the same shape (/blog/[slug] for /blog/hello).
	const screen = state?.screens.find((s) => s.url === path || s.url === `${path}.html`) ?? state?.screens.find((s) => s.url && new RegExp(`^${s.url.replace(/\[[^\]]+\]/g, '[^/]+')}$`).test(path));
	const surface = screen?.surface ?? state?.surface ?? 'site';
	const threshold = Number(opts.threshold ?? brand().reviewThreshold);
	const outDir = join(root, '.ds', 'review', new Date().toISOString().replace(/[:.]/g, '-'));
	const shots = await capture(target, ['desktop', 'mobile'], outDir);
	const previous = screen ? state?.reviews[screen.id] : undefined;
	const { card, model } = await critique(shots, target, surface, previous);
	const failing = Object.entries(card.scores).filter(([, v]) => v < threshold);
	mkdirSync(outDir, { recursive: true });
	writeFileSync(join(outDir, 'scorecard.json'), `${JSON.stringify({ url: target, model, ...card }, null, 2)}\n`);
	if (state) {
		state.baseUrl = url.origin;
		if (screen) state.reviews[screen.id] = { at: new Date().toISOString(), url: target, scores: card.scores, passed: failing.length === 0, punch: card.punch_list.map((p) => ({ severity: p.severity, where: `${p.viewport} / ${p.region}`, issue: p.issue, fix: p.fix })), verdict: card.verdict };
		writeState(root, state);
	}
	emit(opts, { url: target, screen: screen?.id, model, threshold, pass: failing.length === 0, ...card, screenshots: outDir }, () =>
		[
			`Review of ${target}${screen ? ` (screen ${screen.id})` : ''}, threshold ${threshold}`,
			`  For: ${card.purpose}`,
			...Object.entries(card.scores).map(([k, v]) => `  ${k.padEnd(15)} ${v < threshold ? color.red(String(v)) : color.green(String(v))}`),
			'',
			...card.punch_list.map((p, i) => `  ${i + 1}. [${p.severity}] ${p.viewport} / ${p.region}: ${p.issue}\n     Fix: ${p.fix}`),
			'',
			card.verdict,
			failing.length ? color.red(`Below ${threshold}: ${failing.map(([k]) => k).join(', ')}. Fix the punch list (styling only) and review again.`) : color.green(`Passed. Run \`${cli()}\` for the next task.`),
			color.dim(`Screenshots: ${outDir}`),
		].join('\n'),
	);
	process.exitCode = failing.length ? 1 : 0;
}
