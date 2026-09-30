import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { loadConfig } from '../../lib/config.js';
import { findItem, loadRegistry } from '../../lib/registry.js';
import type { Rule } from '../context.js';
import { defaultExportRoot, registryItemFor, slotElements } from '../jsx.js';
import { elementName, importFor, jsxAttr, literalAttr, type Node } from '../source.js';
import type { RawFinding } from '../types.js';

const FORBIDDEN_SOURCES: Record<string, RegExp> = {
	dialog: /(^|\/)(dialog|alert-dialog|modal)$|@radix-ui\/react-(alert-)?dialog|vaul/,
	toast: /(^|\/)(toast|toaster|sonner)$|^sonner$|react-hot-toast|react-toastify/,
	carousel: /(^|\/)carousel$|embla-carousel|swiper|keen-slider|react-slick/,
};

function templateUses(ctx: Parameters<Rule['run']>[0]) {
	return ctx.file.jsxElements.map((el) => ({ el, item: registryItemFor(ctx.file, el) })).filter((x) => x.item?.type === 'template');
}

export const templateStructure: Rule = {
	id: 'template-structure',
	description: "Template slots follow the template's structure: required slots filled, max respected, only allowed blocks, nothing forbidden.",
	run(ctx) {
		const out: RawFinding[] = [];
		const { file } = ctx;
		for (const { el, item } of templateUses(ctx)) {
			const structure = item!.docs.structure!;
			const attrs: Node[] = el.openingElement.attributes ?? [];
			for (const attr of attrs) {
				if (attr.type === 'JSXSpreadAttribute') {
					out.push({ rule: 'template-structure', message: `Spread props on <${elementName(el)}>`, hint: 'Pass each slot explicitly so the structure can be checked', offset: attr.start });
					continue;
				}
				const name = attr.name?.name;
				if (name && !structure.slots[name] && name !== 'key') out.push({ rule: 'template-structure', message: `Unknown slot \`${name}\` on ${item!.name}`, hint: `Slots: ${Object.keys(structure.slots).join(', ')}`, offset: attr.start });
			}
			for (const [slot, def] of Object.entries(structure.slots)) {
				const attr = jsxAttr(el, slot);
				const elements = slotElements(attr?.value);
				if (def.required && elements.length === 0) {
					out.push({ rule: 'template-structure', message: `Required slot \`${slot}\` is empty on ${item!.name}`, hint: `Default: <${findItem(def.default)?.exportName ?? def.default} />. Run \`${loadConfig().cli} docs ${item!.name}\``, offset: attr?.start ?? el.start });
					continue;
				}
				if (elements.length > def.max) out.push({ rule: 'template-structure', message: `Slot \`${slot}\` has ${elements.length} blocks, max ${def.max}`, hint: 'Remove the extra blocks', offset: attr!.start });
				for (const child of elements) {
					if (child.type !== 'JSXElement') continue;
					const block = registryItemFor(file, child);
					if (block && block.type === 'block' && !def.allowed.includes(block.name)) {
						out.push({ rule: 'template-structure', message: `<${elementName(child)}> (${block.name}) is not allowed in slot \`${slot}\``, hint: `Allowed: ${def.allowed.join(', ')}`, offset: child.start });
					}
				}
			}
		}
		if (templateUses(ctx).length) {
			const forbidden = new Set(templateUses(ctx).flatMap(({ item }) => item!.docs.structure!.forbidden));
			for (const imp of file.imports) {
				for (const f of forbidden) {
					const re = FORBIDDEN_SOURCES[f];
					const reg = findItem(f);
					if ((re && re.test(imp.source)) || (reg?.importPath && imp.source === reg.importPath)) {
						const offset = file.text.indexOf(imp.source);
						out.push({ rule: 'template-structure', message: `${f} is forbidden on this template (import from "${imp.source}")`, hint: 'Remove it. principles.md: no marketing modals, toasts or carousels.', offset });
					}
				}
			}
		}
		return out;
	},
};

export const noUnregisteredSection: Rule = {
	id: 'no-unregistered-section',
	description: 'Pages start from a template, and every section is a registry block.',
	run(ctx) {
		const out: RawFinding[] = [];
		const { file } = ctx;
		const bin = loadConfig().cli;
		for (const { el, item } of templateUses(ctx)) {
			for (const slot of Object.keys(item!.docs.structure!.slots)) {
				for (const child of slotElements(jsxAttr(el, slot)?.value)) {
					if (child.type === 'JSXElement') {
						const block = registryItemFor(file, child);
						if (!block || block.type !== 'block') out.push({ rule: 'no-unregistered-section', message: `Slot \`${slot}\` contains <${elementName(child) || 'fragment'}>, which is not a registry block`, hint: `Use a block from \`${bin} docs\` (blocks). Deviations need // ds-override: <reason>`, offset: child.start });
					} else if (child.type !== 'JSXText') {
						out.push({ rule: 'no-unregistered-section', message: `Slot \`${slot}\` is filled with an expression, not a registry block element`, hint: 'Write the block element inline so it can be checked', offset: child.start });
					}
				}
			}
		}
		if (ctx.isPage) {
			const root = defaultExportRoot(file);
			if (root && (root.type === 'JSXElement' || root.type === 'JSXFragment')) {
				const top = root.type === 'JSXFragment' ? (root.children ?? []).filter((c: Node) => c.type === 'JSXElement') : [root];
				const templates = top.filter((c: Node) => registryItemFor(file, c)?.type === 'template');
				if (!templates.length) {
					out.push({ rule: 'no-unregistered-section', message: 'Page structure is hand-written, not a template', hint: `Run \`${bin} resolve "<task>"\` then \`${bin} scaffold <template>\``, offset: root.start });
				}
				if (templates.length) for (const c of top) if (!templates.includes(c) && !/^(Script|JsonLd|Head)$/.test(elementName(c))) out.push({ rule: 'no-unregistered-section', message: `<${elementName(c)}> sits outside the template`, hint: 'Put content in a template slot', offset: c.start });
			}
		}
		return out;
	},
};

export const variantFromList: Rule = {
	id: 'variant-from-list',
	description: "A variant prop must be one of the item's closed variants list.",
	run({ file, isPage }) {
		const out: RawFinding[] = [];
		for (const el of file.jsxElements) {
			const item = registryItemFor(file, el);
			const variants = item?.docs.variants;
			if (!variants) continue;
			const attr = jsxAttr(el, 'variant');
			if (!attr) continue;
			const values = possibleLiterals(attr.value);
			if (!values) {
				if (isPage) out.push({ rule: 'variant-from-list', message: `<${elementName(el)} variant> must be a literal on a page`, hint: `One of: ${variants.join(', ')}`, offset: attr.start });
				continue;
			}
			for (const value of values) if (!variants.includes(value)) out.push({ rule: 'variant-from-list', message: `Variant "${value}" is not in ${item!.name}'s list`, hint: `One of: ${variants.join(', ')}`, offset: attr.start });
		}
		return out;
	},
};

function possibleLiterals(value: Node | undefined): string[] | undefined {
	if (!value) return undefined;
	const expr = value.type === 'JSXExpressionContainer' ? value.expression : value;
	if (expr.type === 'StringLiteral') return [expr.value];
	if (expr.type === 'TemplateLiteral' && expr.expressions.length === 0) return [expr.quasis[0].value.cooked];
	if (expr.type === 'ConditionalExpression') {
		const a = possibleLiterals(expr.consequent);
		const b = possibleLiterals(expr.alternate);
		return a && b ? [...a, ...b] : undefined;
	}
	if (expr.type === 'LogicalExpression' && expr.operator === '??') {
		const b = possibleLiterals(expr.right);
		return b;
	}
	return undefined;
}

const normalize = (text: string) => text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();

export const registryDrift: Rule = {
	id: 'registry-drift',
	description: 'Installed registry files are not hand-edited without a ds-override on line 1.',
	run({ file, relPath, installed }) {
		for (const [id, entry] of Object.entries(installed)) {
			if (!entry.files.includes(relPath)) continue;
			const item = findItem(id);
			if (!item || item.version !== entry.version) return [];
			const source = item.sourceFiles.find((f) => basename(f) === basename(relPath));
			if (!source || !existsSync(source)) return [];
			if (normalize(readFileSync(source, 'utf8')) === normalize(file.text)) return [];
			if (file.overrides.fileReason) return [];
			return [{ rule: 'registry-drift', message: `${item.id}@${item.version} was edited by hand`, hint: `Restore with \`${loadConfig().cli} add ${item.name} --overwrite\`, or put // ds-override: <reason> on line 1`, offset: 0 }];
		}
		return [];
	},
};

export const singlePrimaryAction: Rule = {
	id: 'single-primary-action',
	description: 'One primary action per page (principles.md).',
	run({ file, isPage }) {
		if (!isPage) return [];
		const primaries: Node[] = [];
		const insideNav = (node: Node) => {
			for (let p = file.parents.get(node); p; p = file.parents.get(p)) if (p.type === 'JSXElement' && registryItemFor(file, p)?.name === 'nav') return true;
			return false;
		};
		for (const el of file.jsxElements) {
			if (registryItemFor(file, el)?.name === 'nav' || insideNav(el)) continue;
			if (literalAttr(el, 'variant') === 'primary') primaries.push(el);
			const attr = jsxAttr(el, 'primaryCta');
			if (attr) primaries.push(attr);
		}
		return primaries.slice(1).map((node) => ({ rule: 'single-primary-action', message: `${primaries.length} primary actions on one page`, hint: 'Keep one filled primary. Make the rest variant="secondary" (outline)', offset: node.start }));
	},
};

export const allRegistryNames = () => loadRegistry().map((i) => i.name);
export { importFor };
