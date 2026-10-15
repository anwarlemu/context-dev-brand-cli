import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from './config.js';
import { dsDir } from './paths.js';

// Apps install the package from a git branch (ds.config.json `source`), so every push to that branch is the new
// release. These helpers find which commit an app has, which commit the branch is at, and how to install it.

function readJson(path: string) {
	try {
		return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
	} catch {
		return undefined;
	}
}

/** The spec the app installed the package from (its package.json entry), else the configured source. */
export function sourceSpec(root: string) {
	const bin = loadConfig().bin;
	const pkg = readJson(join(root, 'package.json')) ?? {};
	return (pkg.devDependencies?.[bin] ?? pkg.dependencies?.[bin] ?? loadConfig().source) as string;
}

/** A git spec as a clone URL and a ref, or undefined for registry versions and local paths. */
export function gitRemote(spec: string) {
	const [base, ref = 'HEAD'] = spec.split('#');
	// npm reads both `github:owner/repo` and the bare `owner/repo` shorthand as GitHub.
	const github = base.match(/^(?:github:)?([\w-]+\/[\w.-]+)$/);
	if (github) return { url: `https://github.com/${github[1].replace(/\.git$/, '')}.git`, ref };
	if (/^git\+(https|ssh|file):/.test(base)) return { url: base.replace(/^git\+/, ''), ref };
	return undefined;
}

/** The commit the app's lockfile pins, when the package came from git. */
export function installedCommit(root: string) {
	const lock = readJson(join(root, 'package-lock.json'));
	const resolved: string | undefined = lock?.packages?.[`node_modules/${loadConfig().bin}`]?.resolved;
	return resolved?.match(/#([0-9a-f]{40})$/)?.[1];
}

/** The commit a branch points at, or undefined when git is missing, offline or slow. */
export function latestCommit(remote: { url: string; ref: string }, timeout = 4000) {
	const run = spawnSync('git', ['ls-remote', remote.url, remote.ref], { encoding: 'utf8', timeout, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
	if (run.status !== 0) return undefined;
	return run.stdout.match(/^([0-9a-f]{40})\s/m)?.[1];
}

export function installArgs(packageManager: string, spec: string) {
	if (packageManager === 'npm') return ['install', '--save-dev', spec];
	return ['add', packageManager === 'bun' ? '-d' : '-D', spec];
}

type UpdateCheck = { checkedAt: string; installed?: string; latest?: string };

/**
 * Whether the branch has moved past the app's commit. Asks the remote at most once a day (cached in
 * .ds/update-check.json) so session start stays fast; never in CI.
 */
export function updateAvailable(root: string, { maxAgeMs = 24 * 3600 * 1000 } = {}) {
	if (process.env.CI || process.env.DS_NO_UPDATE_CHECK) return undefined;
	const remote = gitRemote(sourceSpec(root));
	const installed = installedCommit(root);
	if (!remote || !installed) return undefined;
	const path = join(dsDir(root), 'update-check.json');
	const cached = readJson(path) as UpdateCheck | undefined;
	let latest = cached?.installed === installed && Date.now() - Date.parse(cached.checkedAt) < maxAgeMs ? cached.latest : undefined;
	if (!latest) {
		latest = latestCommit(remote, 3000);
		try {
			mkdirSync(dsDir(root), { recursive: true });
			writeFileSync(path, `${JSON.stringify({ checkedAt: new Date().toISOString(), installed, latest } satisfies UpdateCheck, null, 2)}\n`);
		} catch {}
	}
	return latest && latest !== installed ? { installed, latest, ref: remote.ref } : undefined;
}
