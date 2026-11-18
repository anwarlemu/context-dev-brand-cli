import type { Command, Option } from 'commander';
import { deckCatalog } from '../assets/deck.js';
import { imageCatalog } from '../assets/image.js';
import { merchCatalog } from '../assets/merch.js';
import { videoCatalog } from '../assets/video.js';
import { brand, cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { loadIndex } from '../library/registry.js';

// `manifest` (alias `describe`): the one document an agent reads first. It names every command with its flags (read
// from the command definitions, so it cannot drift), every asset template, size, palette, slide, loop and merch item,
// and the components. Commands reject names that are not in it and suggest the closest.

const flagOf = (o: Option) => o.long?.replace(/^--/, '') ?? o.short?.replace(/^-/, '') ?? o.flags;

export function commandsOf(program: Command) {
	return program.commands.map((c) => ({
		name: c.name(),
		aliases: c.aliases(),
		usage: `${cli()} ${c.name()}${c.usage() ? ` ${c.usage()}` : ''}`,
		summary: c.description(),
		flags: c.options.map(flagOf).filter((f, i, all) => all.indexOf(f) === i),
	}));
}

export async function manifest(program: Command) {
	let components: { name: string; type?: string; description?: string }[] = [];
	try {
		components = ((await loadIndex()) as { name: string; type?: string; description?: string }[]).map((i) => ({ name: i.name, type: i.type, description: i.description }));
	} catch {
		// The registry is built separately; without it the manifest still lists the commands and assets.
	}
	const b = brand();
	return {
		schemaVersion: 1,
		name: b.name,
		bin: b.bin,
		run: cli(),
		entry: 'manifest',
		alias: 'describe',
		validation: 'Every command checks its inputs against this document. An unknown command, flag, template, size, palette, slide type, loop, item or variant exits 1 and names the closest match and what is allowed. The CLI does not substitute a nearby value.',
		commands: commandsOf(program),
		commonFlags: ['cwd', 'json', 'help'],
		assets: {
			image: imageCatalog(),
			deck: deckCatalog(),
			video: videoCatalog(),
			merch: merchCatalog(),
			module: 'The renderer is importable from the package: dist/assets/index.js (dot shader, dot field, text layout, logo, PNG, SVG and PDF output).',
		},
		components,
		resources: { guide: `${cli()} guide`, docs: b.registryUrl, index: `${b.registryUrl}/r/index.json` },
	};
}

export function manifestCommand(program: Command) {
	program
		.command('manifest')
		.alias('describe')
		.description('Every command, flag, asset template, size, palette, slide, loop, merch item and component in one document (start here; pass --json)')
		.option('--json', 'JSON output')
		.action(async (_o, cmd: Command) => {
			const opts = cmd.optsWithGlobals() as { json?: boolean };
			const doc = await manifest(program);
			emit(opts, doc, () => [
				`${doc.name} (${doc.run}). Agents: ${doc.run} manifest --json`,
				'',
				'Commands',
				...doc.commands.map((c) => `  ${c.name.padEnd(12)} ${c.summary}`),
				'',
				`Image templates: ${doc.assets.image.templates.map((t) => t.id).join(', ')} (kinds: ${doc.assets.image.kinds.map((k) => k.id).join(', ')})`,
				`Image sizes: ${doc.assets.image.sizes.map((s) => (s.width ? `${s.id} ${s.width}x${s.height}` : s.id)).join(', ')}`,
				`Palettes: ${doc.assets.image.palettes.map((p) => p.name).join(', ')}`,
				`Deck slides: ${doc.assets.deck.slides.map((s) => s.id).join(', ')}`,
				`Video: reel (${doc.assets.video.reel.seconds} s, ${doc.assets.video.reel.width}x${doc.assets.video.reel.height}); loops ${doc.assets.video.loops.templates.map((t) => t.id).join(', ')} at ${doc.assets.video.loops.sizes.map((s) => s.id).join(', ')}`,
				`Merch: ${doc.assets.merch.items.map((i) => `${i.id} ${i.trim.width}x${i.trim.height} in`).join(', ')}`,
				'',
				`Components: ${doc.components.length} (${doc.run} search, ${doc.run} view <name>)`,
			].join('\n'));
		});
}
