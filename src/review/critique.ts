import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { z } from 'zod';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import type { Surface } from '../project/surface.js';
import type { Review } from '../plan/state.js';
import type { Shot } from './capture.js';

// The critique: screenshots of the restyled screen next to the brand's own pages (the reference screenshots), judged
// against the principles and the rubric. The previous punch list is given back so scores stay consistent.

export const scorecardSchema = z.object({
	purpose: z.string(),
	scores: z.object({ hierarchy: z.number(), coherence: z.number(), brand_voice: z.number(), detail_quality: z.number(), accessibility: z.number() }),
	punch_list: z.array(z.object({ viewport: z.string(), region: z.string(), issue: z.string(), fix: z.string(), severity: z.enum(['blocker', 'major', 'minor']) })),
	verdict: z.string(),
});
export type Scorecard = z.infer<typeof scorecardSchema>;

const SYSTEM = `You review a restyled screen for the {{brand}} design system before it ships. The project keeps its own
words, elements and purpose; only its look changed. The first images are the brand's own pages (the reference); the
rest are the restyled screen, top to bottom, at desktop and phone width. Compare them closely: does the screen read as
the same brand, with the same quality? Judge against the principles and the rubric, not general taste. Name exact
regions and give fixes that change styling only (never copy or which elements exist). Be consistent: the same problems
get the same scores.`;

function hasApiCredentials() {
	return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE || existsSync(join(homedir(), '.config', 'anthropic')));
}

export function pickEngine(): 'api' | 'claude-code' {
	const wanted = process.env.DS_REVIEW_ENGINE;
	if (wanted === 'api' || wanted === 'claude-code') return wanted;
	if (hasApiCredentials()) return 'api';
	if (spawnSync('claude', ['--version'], { encoding: 'utf8' }).status === 0) return 'claude-code';
	throw new Error('No way to run the review: set ANTHROPIC_API_KEY, or install and log in to Claude Code (`claude`). Screenshots were captured.');
}

/** The brand pages to compare against: the site's home and a use-case page, or the product's overview and a table. */
export function references(surface: Surface) {
	const dir = pkgPath('brand', 'reference');
	return readdirSync(dir)
		.filter((f) => f.startsWith(surface === 'product' ? 'product-' : 'site-') && /desktop\.jpg$/.test(f))
		.slice(0, 2)
		.map((f) => join(dir, f));
}

function guide(surface: Surface, previous?: Review) {
	const read = (f: string) => readFileSync(pkgPath('brand', f), 'utf8');
	const prior = previous ? `\n\n# Previous review of this screen (scores ${JSON.stringify(previous.scores)})\nCheck each item first and say if it is fixed:\n${previous.punch.map((p) => `- [${p.severity}] ${p.where}: ${p.issue}`).join('\n')}` : '';
	return `# principles.md\n${read('principles.md')}\n\n# rubric.md\n${read('rubric.md')}\n\nThis screen is a ${surface === 'product' ? 'product screen: compare with the product reference' : 'site page: compare with the site reference'}.${prior}`;
}

export async function critique(shots: Shot[], url: string, surface: Surface, previous?: Review): Promise<{ card: Scorecard; model: string }> {
	const system = SYSTEM.replaceAll('{{brand}}', brand().name);
	const refs = references(surface);
	if (pickEngine() === 'claude-code') {
		const prompt = [
			guide(surface, previous),
			`\n# Screen\n${url}\n`,
			'Read every image file below with the Read tool before scoring.',
			'Reference (the brand\'s own pages):',
			...refs.map((r) => `- ${r}`),
			'Restyled screen:',
			...shots.map((s) => `- ${s.path} (${s.viewport}, slice ${s.index + 1})`),
			'',
			'Return the scorecard and the punch list.',
		].join('\n');
		const schema = (({ $schema, ...rest }) => rest)(z.toJSONSchema(scorecardSchema) as Record<string, unknown>);
		const args = ['-p', '--output-format', 'json', '--json-schema', JSON.stringify(schema), '--allowedTools', 'Read', '--add-dir', dirname(shots[0].path), '--add-dir', pkgPath('brand', 'reference'), '--append-system-prompt', system];
		if (process.env.DS_REVIEW_MODEL) args.push('--model', process.env.DS_REVIEW_MODEL);
		const env = { ...process.env };
		delete env.CLAUDECODE;
		delete env.CLAUDE_CODE_ENTRYPOINT;
		const run = spawnSync('claude', args, { input: prompt, encoding: 'utf8', env, maxBuffer: 50 * 1024 * 1024, timeout: 15 * 60 * 1000 });
		if (run.status !== 0) throw new Error(`claude -p failed (exit ${run.status}): ${(run.stderr || run.stdout).slice(0, 400)}`);
		const out = JSON.parse(run.stdout) as { structured_output?: unknown; result?: string; is_error?: boolean; modelUsage?: Record<string, unknown> };
		if (out.is_error) throw new Error(`claude -p returned an error: ${out.result?.slice(0, 400)}`);
		return { card: scorecardSchema.parse(out.structured_output ?? JSON.parse(out.result ?? '{}')), model: `claude-code (${Object.keys(out.modelUsage ?? {}).join(', ') || 'default'})` };
	}
	const client = new Anthropic();
	const image = (path: string, type: 'image/png' | 'image/jpeg'): Anthropic.Beta.BetaContentBlockParam => ({ type: 'image', source: { type: 'base64', media_type: type, data: readFileSync(path).toString('base64') } });
	const content: Anthropic.Beta.BetaContentBlockParam[] = [{ type: 'text', text: guide(surface, previous) }, { type: 'text', text: 'Reference: the brand\'s own pages.' }];
	for (const r of refs) content.push(image(r, 'image/jpeg'));
	content.push({ type: 'text', text: `Restyled screen: ${url}` });
	for (const shot of shots) {
		content.push({ type: 'text', text: `${shot.viewport}, slice ${shot.index + 1}` });
		content.push(image(shot.path, 'image/png'));
	}
	content.push({ type: 'text', text: 'Return the scorecard and the punch list.' });
	const response = await client.beta.messages.parse({
		model: process.env.DS_REVIEW_MODEL ?? brand().reviewModel,
		max_tokens: 16000,
		system,
		thinking: { type: 'adaptive' },
		output_config: { effort: 'high', format: betaZodOutputFormat(scorecardSchema) },
		messages: [{ role: 'user', content }],
	});
	if (!response.parsed_output) throw new Error(`The review model returned no scorecard (stop_reason ${response.stop_reason}).`);
	return { card: response.parsed_output, model: response.model };
}
