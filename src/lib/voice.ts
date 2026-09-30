import { z } from 'zod';
import { readMarkdown } from './docs.js';
import { pkgPath } from './paths.js';

export const voiceSchema = z.object({
	version: z.string(),
	banned_words: z.array(z.string()),
	banned_chars: z.array(z.string()),
	headline_max_words: z.number(),
	sub_max_words: z.number(),
	button_max_words: z.number(),
	spelling: z.enum(['american', 'british']),
	heading_case: z.enum(['sentence', 'title']),
	product_name: z.string(),
	product_name_wrong: z.array(z.string()).default([]),
	announcement_label: z.string().optional(),
	proper_nouns: z.array(z.string()).default([]),
});
export type Voice = z.infer<typeof voiceSchema>;

let cached: Voice | undefined;
export function loadVoice(): Voice {
	if (!cached) cached = voiceSchema.parse(readMarkdown(pkgPath('voice.md')).frontmatter);
	return cached;
}

export const BRITISH_TO_AMERICAN: Record<string, string> = {
	colour: 'color', colours: 'colors', coloured: 'colored', behaviour: 'behavior', behaviours: 'behaviors', organisation: 'organization',
	organisations: 'organizations', organise: 'organize', optimise: 'optimize', optimised: 'optimized', optimisation: 'optimization',
	analyse: 'analyze', analysed: 'analyzed', centre: 'center', favourite: 'favorite', licence: 'license', catalogue: 'catalog',
	customise: 'customize', customised: 'customized', personalise: 'personalize', personalised: 'personalized', recognise: 'recognize',
	summarise: 'summarize', prioritise: 'prioritize', standardise: 'standardize', visualise: 'visualize', modelling: 'modeling',
	cancelled: 'canceled', travelling: 'traveling', labelled: 'labeled', grey: 'gray', programme: 'program', defence: 'defense',
	artefact: 'artifact', enrol: 'enroll', fulfil: 'fulfill', honour: 'honor', labour: 'labor', neighbour: 'neighbor',
};
