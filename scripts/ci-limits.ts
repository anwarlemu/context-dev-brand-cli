import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { renderTemplate } from '../src/commands/init.js';
import { loadConfig } from '../src/lib/config.js';
import { lineCount } from '../src/lib/docs.js';
import { docsLineCount, loadRegistry } from '../src/lib/registry.js';
import { loadRecipes } from '../src/lib/recipes.js';
import { checkText } from '../src/check/engine.js';

const config = loadConfig();
const problems: string[] = [];

for (const item of loadRegistry()) {
	const n = docsLineCount(item);
	if (n > config.docsMaxLines) problems.push(`${item.id}: docs injection is ${n} lines, cap ${config.docsMaxLines}`);
}
const contract = renderTemplate('contract');
for (const [label, text] of [['contract', contract], ['styling-only contract', renderTemplate('contract', { full: false })]]) if (lineCount(text) > config.contractMaxLines) problems.push(`${label} is ${lineCount(text)} lines, cap ${config.contractMaxLines}`);

// Recipes are copied onto other sites as is, so every value must be a token that exists (or a plain keyword), and
// their motion must follow the animation rules: named properties, token timing, no ease-in.
const tokenNames = new Set([...readFileSync('build/tokens.css', 'utf8').matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
// A raw value is a color, or a length or duration with a unit (1px and 2px borders excepted), written outside var().
const RAW = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(|(?<![\w.-])(?!(?:0|1|2)px\b)\d*\.?\d+(px|rem|em|ms|s|vh|vw|ch)\b/i;
const recipeIds = new Set<string>();
for (const r of loadRecipes()) {
	if (recipeIds.has(r.id)) problems.push(`recipe ${r.id}: duplicate id`);
	recipeIds.add(r.id);
	if ((r.surface === 'product') !== r.id.startsWith('app-')) problems.push(`recipe ${r.id}: product recipes, and only they, start with app-`);
	const all = [['', r.css] as const, ...Object.entries(r.states)];
	for (const [state, decls] of all) {
		for (const [prop, value] of Object.entries(decls)) {
			const where = `recipe ${r.id}${state ? ` ${state}` : ''} ${prop}`;
			for (const v of value.matchAll(/var\((--[a-z0-9-]+)/g)) if (!v[1].startsWith('--ds-') ? !/^--(rise-index|dot-delay|tw-)/.test(v[1]) : !tokenNames.has(v[1])) problems.push(`${where}: unknown token ${v[1]}`);
			const outside = value.replace(/var\([^()]*(\([^()]*\))?[^()]*\)/g, '');
			const raw = outside.match(RAW);
			if (raw) problems.push(`${where}: raw value \`${raw[0]}\` (use a token)`);
			if (/^transition/.test(prop) && /\ball\b/.test(value)) problems.push(`${where}: transition all; name the properties`);
			if (/(ease|easing)-in\b(?!-out)/.test(value)) problems.push(`${where}: ease-in on UI motion`);
		}
	}
	// The Tailwind form gets pasted into className, so it has to pass the same checks the hooks run.
	if (r.tailwind) for (const f of checkText(process.cwd(), 'recipe.tsx', `export const X = () => <div className="${r.tailwind}" />;`).findings.filter((f) => f.severity === 'error')) problems.push(`recipe ${r.id} tailwind: ${f.rule} ${f.message}`);
	if (`${r.name} ${r.use_for} ${r.not_for ?? ''} ${r.rules.join(' ')}`.includes('—')) problems.push(`recipe ${r.id}: em dash`);
}

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const brandPattern = new RegExp(`${config.brand.replace('.', '\\.')}|${config.bin}`, 'i');
for (const file of walk('src').filter((f) => !f.endsWith('.md') && !f.endsWith('.yml'))) if (brandPattern.test(readFileSync(file, 'utf8'))) problems.push(`${file}: hard-coded brand string; read it from ds.config.json`);

const generated = ['principles.md', 'voice.md', 'intents.json', 'review/rubric.md', 'build/contrast-report.md', ...walk('registry'), ...walk('src/skill'), ...walk('tokens')];
for (const file of generated) if (readFileSync(file, 'utf8').includes('—')) problems.push(`${file}: em dash`);

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`ci limits: docs <= ${config.docsMaxLines} lines, contract ${lineCount(contract)} <= ${config.contractMaxLines} lines, no brand string in src, no em dashes in generated files, ${recipeIds.size} recipes valid`);
