import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, cli } from '../lib/brand.js';
import { runCheck } from '../check/engine.js';
import { color } from '../lib/output.js';
import type { Screen } from '../project/screens.js';
import { elementsIn } from './elements.js';
import type { State } from './state.js';

// The queue: one task per main screen (the first also covers the shared shell), then a final sweep. A task is done
// when its files pass the check and its review scored at least the threshold; nothing is self-reported.

export const MAX_SCREENS = 8;

export type TaskStatus = { screen: Screen; errors: number; reviewed: boolean; passed: boolean; touches: string[]; skipped: boolean; done: boolean };

/** What a site's home needs beyond styles: the hero's dot streams and the key phrase of headings in blue. */
export function missingTouches(root: string, screen: Screen, isHome: boolean): string[] {
	if (screen.surface !== 'site' || !isHome) return [];
	const text = screen.files.map((rel) => {
		try {
			return readFileSync(join(root, rel), 'utf8');
		} catch {
			return '';
		}
	}).join('\n');
	const missing: string[] = [];
	if (!/\bdata-ds-dots\b/.test(text)) missing.push('dots');
	if (!/\bds-accent\b/.test(text)) missing.push('accent');
	return missing;
}

export function taskStatus(root: string, state: State, screen: Screen, index: number): TaskStatus {
	if (state.skipped?.[screen.id]) return { screen, errors: 0, reviewed: false, passed: false, touches: [], skipped: true, done: true };
	const check = runCheck(root, { paths: screen.files });
	const review = state.reviews[screen.id];
	const touches = missingTouches(root, screen, index === 0);
	const native = !screen.url;
	const passed = native ? state.marked.includes(screen.id) : !!review?.passed;
	return { screen, errors: check.findings.length, reviewed: !!review, passed, touches, skipped: false, done: check.findings.length === 0 && passed && touches.length === 0 };
}

export const mainScreens = (state: State) => state.screens.slice(0, MAX_SCREENS);

/** The text of one task: short, concrete, with the elements to restyle and how the task is checked. */
export function renderTask(root: string, state: State, status: TaskStatus, index: number, total: number): string {
	const s = status.screen;
	const threshold = brand().reviewThreshold;
	const where = s.url ? `${s.url === '/' ? 'the home page' : s.url}` : s.id;
	const kinds = new Map<string, Map<string, number>>();
	for (const rel of s.files) {
		let text = '';
		try {
			text = readFileSync(join(root, rel), 'utf8');
		} catch {
			continue;
		}
		const counts = new Map<string, number>();
		for (const h of elementsIn(rel, text, s.surface)) counts.set(h.kind, (counts.get(h.kind) ?? 0) + 1);
		if (counts.size) kinds.set(rel, counts);
	}
	const url = s.url && state.baseUrl ? `${state.baseUrl.replace(/\/$/, '')}${s.url}` : s.url ? `http://localhost:<port>${s.url}` : undefined;
	const lines = [
		color.bold(`Task ${index + 1} of ${total}: ${where}${index === 0 ? (s.surface === 'product' ? ' and the app shell (sidebar, top bar, page)' : ' and the shared shell (header, footer, page)') : ''} (${s.surface === 'product' ? 'product screen' : 'site page'}).`),
		`  First say in one line what this screen is for. Keep that: its main action stays the most prominent thing; no words or elements change.`,
		`  Restyle each element the way \`${cli()} look <file>\` shows (exact CSS and Tailwind, with states):`,
		...[...kinds].slice(0, 8).map(([rel, counts]) => `    ${rel}: ${[...counts].map(([k, n]) => (n > 1 ? `${k} x${n}` : k)).join(', ')}`),
		...(kinds.size > 8 ? [`    ...and ${kinds.size - 8} more files`] : []),
		...(status.touches.includes('dots') ? ['  Add data-ds-dots to the hero section (thin dot streams at its edges; nothing else gets dots).'] : []),
		...(status.touches.includes('accent') ? ['  Wrap the closing words of the hero headline and of each section heading in <span class="ds-accent"> (same words, in blue; never a whole heading).'] : []),
		...(status.errors ? [`  ${status.errors} values here are not brand tokens yet: \`${cli()} check ${s.files.slice(0, 3).join(' ')}${s.files.length > 3 ? ' ...' : ''}\` lists each with the token to use.`] : []),
		url
			? `  Then run the app and \`${cli()} review ${url}\`. Done when every score is ${threshold} or more and the check is clean; fix its punch list until then.`
			: `  Native screen: build and look at it, then \`${cli()} done ${s.id}\`.`,
		`  If it cannot pass without changing words or elements (or cannot run here), \`${cli()} skip ${s.id} --reason "<why>"\`; the person sees every skip.`,
		...(status.reviewed && !status.passed ? [color.yellow(`  Last review did not pass: ${(state.reviews[s.id]?.punch ?? []).slice(0, 3).map((p) => p.issue).join('; ')}`)] : []),
		`  Then run \`${cli()}\` for the next task.`,
	];
	return lines.join('\n');
}
