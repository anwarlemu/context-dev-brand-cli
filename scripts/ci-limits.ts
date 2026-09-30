import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { renderTemplate } from '../src/commands/init.js';
import { loadConfig } from '../src/lib/config.js';
import { lineCount } from '../src/lib/docs.js';
import { docsLineCount, loadRegistry } from '../src/lib/registry.js';

const config = loadConfig();
const problems: string[] = [];

for (const item of loadRegistry()) {
	const n = docsLineCount(item);
	if (n > config.docsMaxLines) problems.push(`${item.id}: docs injection is ${n} lines, cap ${config.docsMaxLines}`);
}
const contract = renderTemplate('contract');
if (lineCount(contract) > config.contractMaxLines) problems.push(`contract is ${lineCount(contract)} lines, cap ${config.contractMaxLines}`);

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const brandPattern = new RegExp(`${config.brand.replace('.', '\\.')}|${config.bin}`, 'i');
for (const file of walk('src').filter((f) => !f.endsWith('.md') && !f.endsWith('.yml'))) if (brandPattern.test(readFileSync(file, 'utf8'))) problems.push(`${file}: hard-coded brand string; read it from ds.config.json`);

const generated = ['principles.md', 'voice.md', 'intents.json', 'review/rubric.md', 'build/contrast-report.md', ...walk('registry'), ...walk('src/skill'), ...walk('tokens')];
for (const file of generated) if (readFileSync(file, 'utf8').includes('—')) problems.push(`${file}: em dash`);

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`ci limits: docs <= ${config.docsMaxLines} lines, contract ${lineCount(contract)} <= ${config.contractMaxLines} lines, no brand string in src, no em dashes in generated files`);
