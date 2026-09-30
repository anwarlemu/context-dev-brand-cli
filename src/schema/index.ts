import { z } from 'zod';

export const dsConfigSchema = z.object({
	brand: z.string(),
	bin: z.string(),
	registryUrl: z.string().url(),
	registryMode: z.enum(['local', 'remote']).default('local'),
	siteUrl: z.string().url().optional(),
	framework: z.string(),
	packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
	presetId: z.string(),
	scopeClass: z.string(),
	blocksImportPrefix: z.string(),
	uiImportPrefix: z.string(),
	templatesImportPrefix: z.string(),
	harnesses: z.array(z.enum(['claude-code', 'cursor', 'codex'])),
	docsMaxLines: z.number().int().positive(),
	contractMaxLines: z.number().int().positive(),
	review: z.object({
		model: z.string(),
		threshold: z.number().min(0).max(10),
		viewports: z.array(z.enum(['desktop', 'tablet', 'mobile'])),
	}),
});
export type DsConfig = z.infer<typeof dsConfigSchema>;

export const itemTypeSchema = z.enum(['ui', 'block', 'template', 'flow', 'flow-step']);
export type ItemType = z.infer<typeof itemTypeSchema>;

const slotSchema = z.object({
	allowed: z.array(z.string()).min(1),
	default: z.string(),
	required: z.boolean(),
	max: z.number().int().positive(),
});

export const docsFrontmatterSchema = z
	.object({
		name: z.string().regex(/^[a-z0-9-]+$/),
		type: itemTypeSchema,
		version: z.string().regex(/^\d+\.\d+\.\d+$/),
		use_for: z.string().min(1),
		never: z.array(z.string()).default([]),
		props: z.string().optional(),
		variants: z.array(z.string()).optional(),
		copy_rules: z.string().optional(),
		example: z.string().optional(),
		export: z.string().optional(),
		route: z.string().optional(),
		dependencies: z.array(z.string()).default([]),
		npm: z.array(z.string()).default([]),
		structure: z
			.object({
				slots: z.record(z.string(), slotSchema),
				forbidden: z.array(z.string()).default([]),
			})
			.optional(),
	})
	.superRefine((doc, ctx) => {
		if (doc.type === 'template' && !doc.structure) ctx.addIssue({ code: 'custom', message: 'templates need structure:' });
		for (const [slot, def] of Object.entries(doc.structure?.slots ?? {})) {
			if (!def.allowed.includes(def.default)) ctx.addIssue({ code: 'custom', message: `slot ${slot}: default ${def.default} is not in allowed` });
		}
	});
export type DocsFrontmatter = z.infer<typeof docsFrontmatterSchema>;

export const intentsSchema = z.object({
	version: z.string(),
	ui_triggers: z.array(z.string()),
	synonyms: z.record(z.string(), z.array(z.string())),
	intents: z.record(z.string(), z.string()),
	out_of_scope: z.record(z.string(), z.string()).default({}),
});
export type Intents = z.infer<typeof intentsSchema>;

export const ruleLevelSchema = z.enum(['error', 'warn', 'off']);
export const checkConfigSchema = z.object({
	include: z.array(z.string()),
	exclude: z.array(z.string()).default([]),
	pageGlobs: z.array(z.string()),
	allowRawValues: z.array(z.string()).default([]),
	rules: z.record(z.string(), ruleLevelSchema),
	fast: z.array(z.string()),
});
export type CheckConfig = z.infer<typeof checkConfigSchema>;

export const flowStepSchema = z.object({
	id: z.string(),
	title: z.string(),
	template: z.string(),
	sees: z.string(),
	primary_action: z.string(),
	states: z.object({ loading: z.string(), empty: z.string(), error: z.string(), success: z.string() }),
});
export const flowFrontmatterSchema = z.object({
	name: z.string(),
	type: z.literal('flow'),
	version: z.string(),
	use_for: z.string(),
	steps: z.array(flowStepSchema).min(1),
});
