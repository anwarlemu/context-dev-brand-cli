import type { SourceFile, Node } from './source.js';
import { elementName, importFor } from './source.js';
import { itemByImport, type RegistryItem } from '../lib/registry.js';

export function elementText(element: Node): string {
	const parts: string[] = [];
	const visit = (node: Node) => {
		if (!node) return;
		if (node.type === 'JSXText') parts.push(node.value);
		else if (node.type === 'JSXExpressionContainer') {
			const e = node.expression;
			if (e?.type === 'StringLiteral') parts.push(e.value);
			else if (e?.type === 'TemplateLiteral' && e.expressions.length === 0) parts.push(e.quasis.map((q: Node) => q.value.cooked).join(''));
			else if (e?.type !== 'JSXEmptyExpression') parts.push(' \u0000 ');
		} else if (node.type === 'JSXElement' || node.type === 'JSXFragment') for (const c of node.children ?? []) visit(c);
	};
	for (const c of element.children ?? []) visit(c);
	return parts.join('').replace(/\s+/g, ' ').trim();
}

export function registryItemFor(file: SourceFile, element: Node): RegistryItem | undefined {
	const name = elementName(element);
	if (!name || /^[a-z]/.test(name)) return undefined;
	const imp = importFor(file, name);
	return imp ? itemByImport(imp.source) : undefined;
}

export function slotElements(value: Node | undefined): Node[] {
	if (!value) return [];
	const expr = value.type === 'JSXExpressionContainer' ? value.expression : value;
	if (!expr) return [];
	if (expr.type === 'JSXElement') return [expr];
	if (expr.type === 'JSXFragment') return (expr.children ?? []).filter((c: Node) => c.type === 'JSXElement' || (c.type === 'JSXText' && c.value.trim()) || c.type === 'JSXExpressionContainer' && c.expression.type !== 'JSXEmptyExpression');
	if (expr.type === 'ArrayExpression') return expr.elements.filter(Boolean);
	if (expr.type === 'NullLiteral' || (expr.type === 'Identifier' && expr.name === 'undefined')) return [];
	return [expr];
}

export function defaultExportRoot(file: SourceFile): Node | undefined {
	const body: Node[] = file.ast?.program?.body ?? [];
	const exported = body.find((n) => n.type === 'ExportDefaultDeclaration');
	if (!exported) return undefined;
	let fn = exported.declaration;
	if (fn?.type === 'Identifier') {
		const name = fn.name;
		for (const n of body) {
			if (n.type === 'FunctionDeclaration' && n.id?.name === name) fn = n;
			if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id?.name === name) fn = d.init;
		}
	}
	if (!fn) return undefined;
	if (fn.body?.type === 'JSXElement' || fn.body?.type === 'JSXFragment') return fn.body;
	const statements: Node[] = fn.body?.body ?? [];
	const ret = [...statements].reverse().find((s) => s.type === 'ReturnStatement');
	let arg = ret?.argument;
	while (arg?.type === 'ParenthesizedExpression') arg = arg.expression;
	return arg;
}
