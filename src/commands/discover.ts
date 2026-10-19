import { color } from '../lib/output.js';
import { cli } from '../lib/brand.js';
import { itemName, loadIndex, loadItem } from '../library/registry.js';

export async function list(query: string | undefined, opts: { json?: boolean; surface?: string; type?: string }) {
	if (opts.surface && !['site', 'product'].includes(opts.surface)) throw new Error('--surface is site or product.');
	if (opts.type && !['ui', 'product', 'site', 'visual', 'block', 'hook', 'lib', 'theme'].includes(opts.type)) throw new Error('Unknown item type. Use ui, product, site, block, visual, hook, lib, or theme.');
	const words = (query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
	const items = (await loadIndex()).filter(i => (!opts.surface || i.surface === opts.surface || i.surface === 'both') && (!opts.type || i.type === opts.type) && words.every(word => [i.name, i.title, i.description, i.usage, ...(i.kinds ?? [])].join(' ').toLowerCase().includes(word)));
	if (opts.json) return console.log(JSON.stringify(items, null, 2));
	for (const type of new Set(items.map(i => i.type))) {
		console.log(color.bold(type));
		for (const item of items.filter(i => i.type === type)) console.log(`  ${item.name.padEnd(24)} ${item.description ?? ''}`);
	}
	console.log(`\n${items.length} items. Read \`${cli()} inspect <name> --json\` before installing.`);
}

export async function inspect(names: string[], opts: { json?: boolean }) {
	const items = await Promise.all(names.map(name => loadItem(itemName(name))));
	if (opts.json) return console.log(JSON.stringify(items.length === 1 ? items[0] : items, null, 2));
	console.log(items.map(item => [
		`# ${item.title ?? item.name}`, item.description, `Name: ${item.name}\nType: ${item.type}\nSurface: ${item.surface ?? 'both'}`,
		`Install: ${cli()} add ${item.name}${item.surface === 'site' || item.surface === 'product' ? ` --surface ${item.surface}` : ''}`, `## Usage\n${item.usage ?? ''}`, ...(item.avoid ?? []).map(x => `Avoid: ${x}`), item.notes,
		`Requires: ${(item.requires ?? []).join(', ') || 'none'}\nPackages: ${(item.packages ?? []).join(', ') || 'none'}`,
		`Reference: ${item.reference?.source ?? 'Design-system infrastructure'}\nDocs: ${item.documentation ?? ''}`,
		'## API', ...(item.api ?? []).map(f => `### ${f.path}\n\n\`\`\`tsx\n${f.content}\`\`\``),
		'## Examples', ...(item.exampleFiles ?? []).map(f => `### ${f.path}\n\n\`\`\`tsx\n${f.content}\`\`\``),
		`## Installed files\n${(item.files ?? []).map(f => `- ${f.path}`).join('\n')}`, 'Use --json for complete source and machine-readable metadata.',
	].filter(Boolean).join('\n\n')).join('\n\n'));
}
