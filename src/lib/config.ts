import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CheckConfig, type DsConfig, checkConfigSchema, dsConfigSchema } from '../schema/index.js';
import { pkgPath } from './paths.js';
import { detectProject, supportsComponents } from './project.js';

/**
 * Rules about how things look. On an existing site only these run: the design system restyles what is there and never
 * asks for different copy, sections or page structure (copy-rules, template-structure and the like stay off).
 */
export const STYLE_RULES = new Set(['no-raw-color', 'no-arbitrary-spacing', 'no-off-scale-radius', 'no-off-scale-motion', 'font-family-from-tokens', 'contrast', 'override-approval']);

/**
 * `styles` (an existing site: restyle only) or `all` (a new app built from the templates). Saved by init in
 * .ds/config.json; projects from before that default to `all` only when they were a fresh app that can run the components.
 */
export function brandRules(projectRoot: string): 'styles' | 'all' {
	const path = join(projectRoot, '.ds', 'config.json');
	if (!existsSync(path)) return 'all';
	try {
		const saved = JSON.parse(readFileSync(path, 'utf8')) as { mode?: string; rules?: 'styles' | 'all' };
		if (saved.rules) return saved.rules;
		return saved.mode === 'new' && supportsComponents(detectProject(projectRoot)) ? 'all' : 'styles';
	} catch {
		return 'all';
	}
}

let cached: (DsConfig & { cli: string }) | undefined;
export function loadConfig(): DsConfig & { cli: string } {
	if (!cached) {
		const parsed = dsConfigSchema.parse(JSON.parse(readFileSync(pkgPath('ds.config.json'), 'utf8')));
		cached = { ...parsed, cli: process.env.DS_CLI ?? `npx ${parsed.bin}` };
	}
	return cached;
}

export function loadCheckConfig(projectRoot: string): CheckConfig {
	const base = JSON.parse(readFileSync(pkgPath('checks', 'check.config.json'), 'utf8'));
	const localPath = join(projectRoot, '.ds', 'check.config.json');
	if (existsSync(localPath)) {
		const local = JSON.parse(readFileSync(localPath, 'utf8'));
		for (const key of ['include', 'exclude', 'pageGlobs', 'allowRawValues', 'fast'] as const) if (local[key]) base[key] = local[key];
	}
	if (brandRules(projectRoot) === 'styles') for (const rule of Object.keys(base.rules)) if (!STYLE_RULES.has(rule)) base.rules[rule] = 'off';
	if (existsSync(localPath)) base.rules = { ...base.rules, ...(JSON.parse(readFileSync(localPath, 'utf8')).rules ?? {}) };
	return checkConfigSchema.parse(base);
}
