import type { Rule } from '../context.js';
import { contrast } from './contrast.js';
import { copyRules } from './copy-rules.js';
import { noRawColor } from './no-raw-color.js';
import { noArbitrarySpacing, noOffScaleMotion, noOffScaleRadius } from './scales.js';
import { noUnregisteredSection, registryDrift, singlePrimaryAction, templateStructure, variantFromList } from './structure.js';
import { fontFamilyFromTokens } from './typography.js';

export const RULES: Rule[] = [
	noRawColor,
	noArbitrarySpacing,
	noOffScaleRadius,
	noOffScaleMotion,
	fontFamilyFromTokens,
	copyRules,
	contrast,
	templateStructure,
	noUnregisteredSection,
	variantFromList,
	registryDrift,
	singlePrimaryAction,
];
