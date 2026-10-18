import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

type File = { path: string; content: string };
export type DocumentedItem = { name: string; title?: string; type: string; surface?: string; description?: string; usage?: string; avoid?: string[]; notes?: string; requires?: string[]; packages?: string[]; files?: File[]; api?: File[]; examples?: { name: string; url: string }[]; exampleFiles?: File[]; exampleRequires?: string[]; examplePackages?: string[]; reference?: { source?: string; url?: string; audit?: string }; documentation?: string; install?: string };

/** Emit the actual TypeScript API, so documentation cannot invent prop names or variants. */
export function declarations(root: string) {
	const config = ts.readConfigFile(join(root, 'tsconfig.registry.json'), ts.sys.readFile);
	const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
	const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: false, declaration: true, emitDeclarationOnly: true, declarationMap: false });
	const bySource = new Map<string, string>();
	const result = program.emit(undefined, (_file, text, _bom, _error, sources) => {
		for (const source of sources ?? []) bySource.set(relative(join(root, 'registry'), source.fileName), text);
	}, undefined, true);
	if (result.emitSkipped) throw new Error('Could not derive component API declarations.');
	return bySource;
}

/** Include relative example helpers alongside the entry file; examples are not part of installed component source. */
export function exampleFiles(registry: string, name: string): File[] {
	const files = new Map<string, File>();
	const visit = (path: string) => {
		if (files.has(path)) return;
		const content = readFileSync(join(registry, path), 'utf8');
		files.set(path, { path, content });
		for (const match of content.matchAll(/(?:from|import)\s+["'](\.[^"']+)["']/g)) {
			const base = resolve(registry, dirname(path), match[1]);
			const target = [base, `${base}.tsx`, `${base}.ts`].find(existsSync);
			if (!target) throw new Error(`Missing example helper: ${path} imports ${match[1]}`);
			visit(relative(registry, target));
		}
	};
	if (existsSync(join(registry, 'examples', `${name}.tsx`))) visit(`examples/${name}.tsx`);
	return [...files.values()];
}

export function markdown(item: DocumentedItem, url: string) {
	const blocks = [`# ${item.title ?? item.name}`, item.description ?? '', `Name: \`${item.name}\`\nType: ${item.type}\nSurface: ${item.surface ?? 'both'}`, `## Install\n\n\`\`\`sh\n${item.install}\n\`\`\``,
		`Read [agent instructions](${url}/agents.md) first. Requires React 19.2+ and Tailwind CSS 4 for React components.`,
		`## Usage\n\n${item.usage ?? ''}`, ...(item.avoid?.length ? [`Avoid:\n${item.avoid.map(x => `- ${x}`).join('\n')}`] : []), ...(item.notes ? [item.notes] : []),
		`Dependencies: ${(item.requires ?? []).map(x => `[${x}](${url}/r/${x}.json)`).join(', ') || 'none'}.\nPackages: ${(item.packages ?? []).join(', ') || 'none'}.`,
		`## Reference\n\n${item.reference?.source ?? 'Design-system infrastructure.'}\n${item.reference?.url ? `Reference page: ${item.reference.url}\n` : ''}Coverage: ${item.reference?.audit ?? `${url}/reference-audit.json`}. Public marketing pages do not verify dashboard-only behavior.`,
		`## API\n\n${(item.api ?? []).map(f => `### ${f.path}\n\n\`\`\`tsx\n${f.content}\n\`\`\``).join('\n\n')}`,
		...(item.examples?.length ? [`## Examples\n\nExamples use local demo state. Connect real application callbacks and routes; do not copy demo credentials or /preview/ links. Relative helper files are included below. Install additional example items: ${(item.exampleRequires ?? []).join(', ') || 'none'}. Example packages: ${(item.examplePackages ?? []).join(', ') || 'none'}.\n\n${item.examples.map(e => `- [${e.name}](${e.url})`).join('\n')}`, ...(item.exampleFiles ?? []).map(f => `### ${f.path}\n\n\`\`\`tsx\n${f.content}\n\`\`\``)] : []),
		`## Source\n\nJSON with complete installable source: ${url}/r/${item.name}.json\n\n${(item.files ?? []).map(f => `- \`${f.path}\``).join('\n')}`];
	return blocks.filter(Boolean).join('\n\n') + '\n';
}
