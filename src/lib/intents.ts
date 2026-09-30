import { readFileSync } from 'node:fs';
import { type Intents, intentsSchema } from '../schema/index.js';
import { pkgPath } from './paths.js';

let cached: Intents | undefined;
export function loadIntents(): Intents {
	if (!cached) cached = intentsSchema.parse(JSON.parse(readFileSync(pkgPath('intents.json'), 'utf8')));
	return cached;
}

export type Resolution =
	| { kind: 'match'; phrase: string; matched: string; target: string }
	| { kind: 'out_of_scope'; phrase: string; matched: string; reason: string }
	| { kind: 'none'; ui: boolean };

const normalize = (text: string) => ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;

export function resolveIntent(text: string): Resolution {
	const intents = loadIntents();
	const haystack = normalize(text);
	type Candidate = { phrase: string; matched: string; index: number; kind: 'match' | 'out_of_scope' };
	const candidates: Candidate[] = [];
	const consider = (phrase: string, matched: string, kind: Candidate['kind']) => {
		const index = haystack.indexOf(normalize(matched));
		if (index >= 0) candidates.push({ phrase, matched, index, kind });
	};
	for (const phrase of Object.keys(intents.intents)) {
		consider(phrase, phrase, 'match');
		for (const synonym of intents.synonyms[phrase] ?? []) consider(phrase, synonym, 'match');
	}
	for (const phrase of Object.keys(intents.out_of_scope)) consider(phrase, phrase, 'out_of_scope');
	candidates.sort((a, b) => b.matched.length - a.matched.length || a.index - b.index || a.phrase.localeCompare(b.phrase));
	const best = candidates[0];
	if (best?.kind === 'match') return { kind: 'match', phrase: best.phrase, matched: best.matched, target: intents.intents[best.phrase] };
	if (best?.kind === 'out_of_scope') return { kind: 'out_of_scope', phrase: best.phrase, matched: best.matched, reason: intents.out_of_scope[best.phrase] };
	return { kind: 'none', ui: intents.ui_triggers.some((t) => haystack.includes(normalize(t))) };
}
