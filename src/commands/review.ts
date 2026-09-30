import type { Command } from 'commander';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../lib/config.js';
import { gitDiff } from '../lib/git.js';
import { color, emit } from '../lib/output.js';
import { dsDir, findProjectRoot } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { capture, type ViewportName } from '../review/capture.js';
import { critique } from '../review/critique.js';

export function routeFromPath(path: string) {
	const m = path.replace(/\\/g, '/').match(/(?:^|\/)app\/(.*)page\.[tj]sx?$/);
	if (!m) return undefined;
	const route = m[1].split('/').filter((s) => s && !/^\(.*\)$/.test(s)).join('/');
	return `/${route.replace(/\/$/, '')}`;
}

async function reachable(url: string) {
	try {
		const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(4000) });
		return r.status < 500;
	} catch {
		return false;
	}
}

// A server already on a common port may belong to another app, so a path is always served from this project unless a base URL is given.
async function ensureServer(root: string): Promise<{ base: string; child?: ChildProcess }> {
	const base = process.env.DS_REVIEW_BASE_URL;
	if (base) {
		if (await reachable(base)) return { base };
		throw new Error(`DS_REVIEW_BASE_URL ${base} is not reachable.`);
	}
	if (detectProject(root).framework !== 'next') throw new Error(`Nothing is serving ${base}. Start the dev server or pass a URL.`);
	const port = 3900 + Math.floor(Math.random() * 90);
	const child = spawn('npx', ['next', 'dev', '-p', String(port)], { cwd: root, stdio: 'ignore', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
	const url = `http://localhost:${port}`;
	for (let i = 0; i < 120; i++) {
		if (await reachable(url)) return { base: url, child };
		await new Promise((r) => setTimeout(r, 1000));
	}
	child.kill();
	throw new Error('next dev did not start within 120s');
}

export function registerReview(program: Command) {
	program
		.command('review [target]')
		.description('Screenshot a page and have the editor model critique it against principles.md. Exits non-zero under threshold')
		.option('--viewports <list>', 'desktop,tablet,mobile')
		.option('--threshold <n>', 'minimum score for every dimension')
		.option('--json', 'JSON output')
		.action(async (target: string | undefined, opts) => {
			const root = findProjectRoot();
			const config = loadConfig();
			const threshold = Number(opts.threshold ?? config.review.threshold);
			const viewports = (opts.viewports ? String(opts.viewports).split(',') : config.review.viewports) as ViewportName[];
			let url: string;
			let child: ChildProcess | undefined;
			let diffPaths: string[] = [];
			if (target && /^https?:\/\//.test(target)) url = target;
			else {
				const route = target ? routeFromPath(target) ?? (target.startsWith('/') ? target : undefined) : '/';
				if (!route) throw new Error(`Cannot map ${target} to a route. Pass a URL or an app/**/page.tsx path.`);
				if (target && existsSync(join(root, target))) diffPaths = [target];
				const server = await ensureServer(root);
				child = server.child;
				url = `${server.base}${route}`;
			}
			const outDir = join(dsDir(root), 'review', new Date().toISOString().replace(/[:.]/g, '-'));
			try {
				const shots = await capture(url, viewports, outDir);
				const { card, model } = await critique(shots, gitDiff(root, diffPaths), url);
				const failing = Object.entries(card.scores).filter(([, v]) => v < threshold);
				const report = { url, model, threshold, pass: failing.length === 0, ...card, screenshots: shots.map((s) => s.path) };
				mkdirSync(join(dsDir(root), 'review'), { recursive: true });
				writeFileSync(join(outDir, 'scorecard.json'), `${JSON.stringify(report, null, 2)}\n`);
				writeFileSync(join(dsDir(root), 'review', 'last.json'), `${JSON.stringify(report, null, 2)}\n`);
				emit(opts, report, () =>
					[
						`Review of ${url} (${model}), threshold ${threshold}`,
						...Object.entries(card.scores).map(([k, v]) => `  ${k.padEnd(15)} ${v < threshold ? color.red(String(v)) : color.green(String(v))}`),
						'',
						'Punch list:',
						...card.punch_list.map((p, i) => `  ${i + 1}. [${p.severity}] ${p.viewport} / ${p.region}: "${p.quote}"\n     ${p.issue}\n     Fix: ${p.fix}`),
						'',
						card.verdict,
						failing.length ? color.red(`Below threshold: ${failing.map(([k]) => k).join(', ')}`) : color.green('All scores at or above threshold. A person still signs off.'),
						`Screenshots: ${outDir}`,
					].join('\n'),
				);
				process.exitCode = failing.length ? 1 : 0;
			} finally {
				child?.kill();
			}
		});
}
