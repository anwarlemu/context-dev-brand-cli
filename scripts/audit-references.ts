// Rebuild source coverage from read-only, pinned reference commits. Run after changing registry source.
// Source mapping is evidence of provenance, not a claim of pixel or behavioral identity.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;
const website = process.env.WEBSITE_REFERENCE ?? join(root, '../brand-dev-webapp');
const dashboard = process.env.DASHBOARD_REFERENCE ?? join(root, '../context-dashboard');
const git = (repo: string, ...args: string[]) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const commits = { website: git(website, 'rev-parse', process.env.WEBSITE_REFERENCE_COMMIT ?? '59e4273e').trim(), retainedWebsite: git(website, 'rev-parse', 'c1cfbca6').trim(), legacyWebsite: git(website, 'rev-parse', '3ae05ca3').trim(), dashboard: git(dashboard, 'rev-parse', process.env.DASHBOARD_REFERENCE_COMMIT ?? 'c0ddf7a').trim() };
const trees = Object.fromEntries(Object.entries(commits).map(([key, commit]) => [key, git(key === 'dashboard' ? dashboard : website, 'ls-tree', '-r', '--name-only', commit, 'src').trim().split('\n')]));
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const cache = new Map<string, string>();
function source(kind: keyof typeof commits, path: string) {
	const key = `${kind}:${path}`;
	if (!cache.has(key)) cache.set(key, git(kind === 'dashboard' ? dashboard : website, 'show', `${commits[kind]}:${path}`));
	const content = cache.get(key)!;
	return { repository: kind === 'dashboard' ? 'context-dashboard' : 'brand-dev-webapp', commit: commits[kind], path, sha256: hash(content), retained: kind === 'retainedWebsite' || kind === 'legacyWebsite', exports: [...content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|type|interface)\s+(\w+)/g)].map(m => m[1]) };
}
const knownInfrastructure = new Set(['navigation', 'surface']);
const records = readdirSync(join(root, 'registry/docs')).filter(f => f.endsWith('.md')).sort().map(file => {
	const text = readFileSync(join(root, 'registry/docs', file), 'utf8');
	const docs = parse(text.match(/^---\n([\s\S]*?)\n---/)![1]);
	const name: string = docs.name;
	const dir = { ui: 'ui', site: 'site', product: 'product', visual: 'visuals', block: 'blocks' }[docs.type as string];
	const paths: string[] = docs.files ?? [dir ? `components/${dir}/${name}.tsx` : `${docs.type === 'lib' ? 'lib' : 'hooks'}/${name}.ts`];
	const library = paths.map(path => ({ path, sha256: hash(readFileSync(join(root, 'registry', path), 'utf8')) }));
	const refs = new Map<string, ReturnType<typeof source>>();
	const missing: string[] = [];
	let repo: keyof typeof commits = /context-dashboard|^dashboard/.test(docs.source ?? '') ? 'dashboard' : 'website';
	let lastDirectory = '';
	const chunks: string[] = (docs.source ?? '').split(/;| and the preview in | and |\(\+ /);
	for (const chunk of chunks) {
		if (/website|^site /.test(chunk.trim())) repo = 'website';
		if (/context-dashboard/.test(chunk)) repo = 'dashboard';
		const matches = [...chunk.matchAll(/(?:src\/[\w/().\[\]-]+\.(?:tsx?|css)|[\w/-]+\.(?:tsx?|css))/g)];
		for (const match of matches) {
			let path = match[0].startsWith('src/') ? match[0] : `${lastDirectory}/${match[0]}`;
			if (path.endsWith('product-landing-content.ts')) path += 'x';
			if (path.includes('/firecrawl/firecrawl/')) path = path.replace('/firecrawl/firecrawl/', '/firecrawl/');
			lastDirectory = dirname(path);
			const order: (keyof typeof commits)[] = repo === 'dashboard' ? ['dashboard', 'retainedWebsite', 'legacyWebsite'] : ['website', 'retainedWebsite', 'legacyWebsite'];
			const found = order.find(kind => trees[kind].includes(path));
			if (found) refs.set(`${found}:${path}`, source(found, path));
			else missing.push(path);
		}
	}
	if (name === 'glyph-engine') for (const path of paths) {
		const candidate = `src/components/dots/${basename(path)}`;
		if (trees.dashboard.includes(candidate)) refs.set(candidate, source('dashboard', candidate));
	}
	if (!refs.size && !knownInfrastructure.has(name)) throw new Error(`No reference found for ${name}: ${docs.source}`);
	return { name, surface: docs.surface, kind: knownInfrastructure.has(name) ? 'library-infrastructure' : docs.surface === 'product' ? 'dashboard' : 'website', library, sources: [...refs.values()], unresolvedHistoricalPaths: missing, scope: knownInfrastructure.has(name) ? 'Integration helper; no public website counterpart.' : docs.surface === 'product' ? 'Source reference; dashboard behavior cannot be verified on the public marketing site.' : 'Tokenized, framework-independent adaptation. Public measurements cover shared styles; retained variants are not a claim of current public-page parity.' };
});
const measurementFile = join(root, 'brand/reference-measurements.json');
const measurements = existsSync(measurementFile) ? JSON.parse(readFileSync(measurementFile, 'utf8')) : undefined;
writeFileSync(join(root, 'brand/reference-audit.json'), JSON.stringify({ schemaVersion: 1, checkedAt: new Date().toISOString(), method: 'Resolved every documented source against pinned read-only git commits, recorded source and library hashes, extracted reference exports, and checked shared styles in a browser. Component source is adapted to tokens and reusable props. Source coverage does not certify every variant as visually or behaviorally identical.', references: commits, measurements, items: records }, null, 2) + '\n');
console.log(JSON.stringify({ items: records.length, sourceFiles: cache.size, retainedVariants: records.filter(r => r.sources.some(s => s.retained)).map(r => r.name), historicalPaths: records.filter(r => r.unresolvedHistoricalPaths.length).map(r => ({ name: r.name, paths: r.unresolvedHistoricalPaths })) }, null, 2));
