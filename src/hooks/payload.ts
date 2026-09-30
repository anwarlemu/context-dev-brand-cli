import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, relative, sep } from 'node:path';

export type HookInput = Record<string, any>;

export function readHookInput(): HookInput {
	try {
		const raw = readFileSync(0, 'utf8');
		return raw.trim() ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

export const sessionIdOf = (input: HookInput) => String(input.session_id ?? input.sessionId ?? input.conversation_id ?? input.generation_id ?? 'default');
export const promptOf = (input: HookInput) => String(input.prompt ?? input.user_prompt ?? input.userPrompt ?? '');

export type ProposedWrite = { relPath: string; before: string; after: string };

function applyEdit(text: string, oldString: string, newString: string, replaceAll?: boolean) {
	if (!oldString) return newString + text;
	if (replaceAll) return text.split(oldString).join(newString);
	const i = text.indexOf(oldString);
	return i < 0 ? text : text.slice(0, i) + newString + text.slice(i + oldString.length);
}

export function proposedWrite(input: HookInput, root: string): ProposedWrite | undefined {
	const tool = String(input.tool_name ?? input.toolName ?? '');
	const ti = input.tool_input ?? input.toolInput ?? input;
	const path = ti.file_path ?? ti.filePath ?? ti.path ?? ti.file;
	if (!path || typeof path !== 'string') return undefined;
	const abs = isAbsolute(path) ? path : join(root, path);
	const relPath = relative(root, abs).split(sep).join('/');
	if (relPath.startsWith('..')) return undefined;
	const before = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
	let after = before;
	if (typeof ti.content === 'string' && /write/i.test(tool)) after = ti.content;
	else if (Array.isArray(ti.edits)) for (const e of ti.edits) after = applyEdit(after, e.old_string ?? e.oldString ?? '', e.new_string ?? e.newString ?? '', e.replace_all);
	else if (typeof ti.old_string === 'string' || typeof ti.new_string === 'string') after = applyEdit(after, ti.old_string ?? '', ti.new_string ?? '', ti.replace_all);
	else if (typeof ti.content === 'string') after = ti.content;
	else if (typeof ti.text === 'string') after = ti.text;
	else return undefined;
	return { relPath, before, after };
}
