import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { z } from 'zod';
import { loadConfig } from '../lib/config.js';
import { pkgPath } from '../lib/paths.js';
import type { Shot } from './capture.js';

export const scorecardSchema = z.object({
	scores: z.object({
		hierarchy: z.number(),
		coherence: z.number(),
		brand_voice: z.number(),
		detail_quality: z.number(),
		accessibility: z.number(),
	}),
	punch_list: z.array(
		z.object({
			viewport: z.string(),
			region: z.string(),
			quote: z.string(),
			issue: z.string(),
			fix: z.string(),
			severity: z.enum(['blocker', 'major', 'minor']),
		}),
	),
	verdict: z.string(),
});
export type Scorecard = z.infer<typeof scorecardSchema>;

const SYSTEM = `You are the editor for the {{brand}} design system. You review screenshots of a page before it ships.
Find what is dead, generic, or off-principle. Reference exact regions (section and viewport) and quote exact copy.
Judge against the principles, voice and rubric you are given, not general taste. Do not praise. Score each dimension 0 to 10 honestly: 7 means shippable after the punch list, 5 means generic.
A human editor signs off after you; your job is to make that review fast by being specific.`;

function hasApiCredentials() {
	return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE || existsSync(join(homedir(), '.config', 'anthropic')));
}

function hasClaudeCode() {
	return spawnSync('claude', ['--version'], { encoding: 'utf8' }).status === 0;
}

export type ReviewEngine = 'api' | 'claude-code';

export function pickEngine(): ReviewEngine {
	const wanted = process.env.DS_REVIEW_ENGINE;
	if (wanted === 'api' || wanted === 'claude-code') return wanted;
	if (hasApiCredentials()) return 'api';
	if (hasClaudeCode()) return 'claude-code';
	throw new Error('No way to run the critique: set ANTHROPIC_API_KEY, or install and log in to Claude Code (`claude`). Screenshots were captured.');
}

function contextText(diff: string, target: string) {
	const read = (p: string) => readFileSync(pkgPath(p), 'utf8');
	return `# principles.md\n${read('principles.md')}\n\n# voice.md\n${read('voice.md')}\n\n# review/rubric.md\n${read('review/rubric.md')}\n\n# Target\n${target}\n\n# git diff (may be truncated)\n${diff.slice(0, 60_000) || '(no diff)'}`;
}

// Uses the local Claude Code login, so review works without an API key.
function critiqueWithClaudeCode(shots: Shot[], diff: string, target: string, system: string) {
	const shotDir = dirname(shots[0].path);
	const prompt = [
		contextText(diff, target),
		'',
		'# Screenshots',
		'Read every one of these image files with the Read tool before scoring. They are slices of the page, top to bottom, per viewport:',
		...shots.map((s) => `- ${s.path} (${s.viewport}, slice ${s.index + 1}, page y ${s.top} to ${s.top + s.height}px)`),
		'',
		'Return the scorecard and the punch list.',
	].join('\n');
	const args = ['-p', '--output-format', 'json', '--json-schema', JSON.stringify((({ $schema, ...rest }) => rest)(z.toJSONSchema(scorecardSchema) as Record<string, unknown>)), '--allowedTools', 'Read', '--add-dir', shotDir, '--append-system-prompt', system];
	if (process.env.DS_REVIEW_MODEL) args.push('--model', process.env.DS_REVIEW_MODEL);
	const env = { ...process.env };
	delete env.CLAUDECODE;
	delete env.CLAUDE_CODE_ENTRYPOINT;
	const run = spawnSync('claude', args, { input: prompt, encoding: 'utf8', env, maxBuffer: 50 * 1024 * 1024, timeout: 15 * 60 * 1000 });
	if (run.status !== 0) throw new Error(`claude -p failed (exit ${run.status}): ${(run.stderr || run.stdout).slice(0, 400)}`);
	const out = JSON.parse(run.stdout) as { structured_output?: unknown; result?: string; is_error?: boolean; modelUsage?: Record<string, unknown> };
	if (out.is_error) throw new Error(`claude -p returned an error: ${out.result?.slice(0, 400)}`);
	const card = scorecardSchema.parse(out.structured_output ?? JSON.parse(out.result ?? '{}'));
	return { card, model: `claude-code (${Object.keys(out.modelUsage ?? {}).join(', ') || 'default model'})` };
}

export async function critique(shots: Shot[], diff: string, target: string): Promise<{ card: Scorecard; model: string; refused?: string }> {
	const config = loadConfig();
	const model = process.env.DS_REVIEW_MODEL ?? config.review.model;
	const system = SYSTEM.replaceAll('{{brand}}', config.brand);
	if (pickEngine() === 'claude-code') return critiqueWithClaudeCode(shots, diff, target, system);
	const read = (p: string) => readFileSync(pkgPath(p), 'utf8');
	const client = new Anthropic();
	const content: Anthropic.Beta.BetaContentBlockParam[] = [
		{ type: 'text', text: `# principles.md\n${read('principles.md')}\n\n# voice.md\n${read('voice.md')}\n\n# review/rubric.md\n${read('review/rubric.md')}` },
		{ type: 'text', text: `# Target\n${target}\n\n# git diff (may be truncated)\n${diff.slice(0, 60_000) || '(no diff)'}` },
	];
	for (const shot of shots) {
		content.push({ type: 'text', text: `Screenshot: ${shot.viewport}, slice ${shot.index + 1}, page y ${shot.top} to ${shot.top + shot.height}px` });
		content.push({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: readFileSync(shot.path).toString('base64') } });
	}
	content.push({ type: 'text', text: 'Return the scorecard and the punch list.' });
	const response = await client.beta.messages.parse({
		model,
		max_tokens: 16000,
		betas: ['server-side-fallback-2026-07-01'],
		fallbacks: 'default',
		system,
		thinking: { type: 'adaptive' },
		output_config: { effort: 'high', format: betaZodOutputFormat(scorecardSchema) },
		messages: [{ role: 'user', content }],
	});
	if (response.stop_reason === 'refusal') throw new Error(`The review model declined (${response.stop_details?.category ?? 'no category'}). Review by hand.`);
	if (!response.parsed_output) throw new Error(`The review model returned no scorecard (stop_reason ${response.stop_reason}).`);
	return { card: response.parsed_output, model: response.model };
}
