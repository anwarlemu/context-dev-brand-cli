import type { CheckConfig } from '../schema/index.js';
import type { Installed } from '../lib/state.js';
import type { Voice } from '../lib/voice.js';
import type { SourceFile } from './source.js';
import type { RawFinding } from './types.js';
import type { Vocab } from './vocab.js';

export type RuleContext = {
	file: SourceFile;
	relPath: string;
	isPage: boolean;
	vocab: Vocab;
	voice: Voice;
	config: CheckConfig;
	installed: Installed;
	projectRoot: string;
};

export type Rule = { id: string; description: string; run: (ctx: RuleContext) => RawFinding[] };
