import type { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { loadConfig } from '../lib/config.js';
import { color, emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { type Surface, detectComponents, findRecipe, loadRecipes, renderRecipe, surfaceFor } from '../lib/recipes.js';

const GROUPS = ['page', 'text', 'actions', 'forms', 'containers', 'navigation', 'data', 'feedback'] as const;

export function registerStyle(program: Command) {
	program
		.command('style [component]')
		.description('How the brand styles a kind of element (button-primary, card-clickable, app-table-row...): CSS and Tailwind. No name: the index. --detect: which recipe each element in a file needs')
		.option('--surface <surface>', 'marketing (site) or product (dashboard, app); default from the project or the file path')
		.option('--for <selector>', 'write the CSS for this selector instead of a placeholder class')
		.option('--css', 'CSS only')
		.option('--tailwind', 'Tailwind classes only')
		.option('--detect <files...>', 'list the elements in these files and the recipe for each')
		.option('--json', 'JSON output')
		.action((component: string | undefined, opts) => {
			const root = findProjectRoot();
			const cli = loadConfig().cli;
			const recipes = loadRecipes();
			if (!recipes.length) throw new Error('No recipes are bundled with this version.');
			if (opts.detect) {
				const results = (opts.detect as string[]).map((p) => {
					const abs = resolve(process.cwd(), p);
					if (!existsSync(abs)) throw new Error(`No file ${p}`);
					const rel = relative(root, abs);
					const surface: Surface = opts.surface ?? surfaceFor(root, rel);
					return { file: rel, surface, components: detectComponents(rel, readFileSync(abs, 'utf8'), surface) };
				});
				emit(opts, results, () =>
					results
						.map((r) => [`${r.file} (${r.surface}): ${r.components.length} elements with a recipe`, ...r.components.map((c) => `  ${String(c.line).padStart(4)}  ${c.label}  ->  ${c.recipe}`)].join('\n'))
						.concat(`\n\`${cli} style <recipe>\` prints the declarations. Change the element's styling only, never its content or structure.`)
						.join('\n'),
				);
				return;
			}
			if (!component) {
				const surfaces: Surface[] = opts.surface ? [opts.surface] : ['marketing', 'product'];
				emit(opts, recipes.filter((r) => surfaces.includes(r.surface)).map(({ id, surface, group, name, use_for }) => ({ id, surface, group, name, use_for })), () =>
					[
						...surfaces.flatMap((s) => [
							color.bold(s === 'marketing' ? 'Marketing site' : 'Product (dashboard, settings, app)'),
							...GROUPS.flatMap((g) => {
								const list = recipes.filter((r) => r.surface === s && r.group === g);
								return list.length ? [`  ${g}`, ...list.map((r) => `    ${r.id.padEnd(28)} ${r.use_for}`)] : [];
							}),
							'',
						]),
						`\`${cli} style <id>\` for the declarations; \`${cli} style --detect <file>\` to match a file's elements.`,
					].join('\n'),
				);
				return;
			}
			const recipe = findRecipe(component);
			if (!recipe) {
				const near = recipes.filter((r) => r.id.includes(component) || component.includes(r.id.replace(/^app-/, ''))).map((r) => r.id);
				throw new Error(`No recipe "${component}".${near.length ? ` Did you mean: ${near.slice(0, 6).join(', ')}?` : ''} \`${cli} style\` lists them.`);
			}
			const format = opts.css ? 'css' : opts.tailwind ? 'tailwind' : 'both';
			emit(opts, recipe, () => renderRecipe(recipe, { selector: opts.for, format }));
		});
}
