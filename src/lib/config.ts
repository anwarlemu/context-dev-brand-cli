import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CheckConfig, type DsConfig, checkConfigSchema, dsConfigSchema } from '../schema/index.js';
import { pkgPath } from './paths.js';

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
		base.rules = { ...base.rules, ...(local.rules ?? {}) };
	}
	return checkConfigSchema.parse(base);
}
