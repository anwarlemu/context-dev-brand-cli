import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

export type ParsedMarkdown = { frontmatter: Record<string, unknown>; body: string; raw: string };

export function parseFrontmatter(raw: string): ParsedMarkdown {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return { frontmatter: {}, body: raw, raw };
	return { frontmatter: (parseYaml(match[1]) as Record<string, unknown>) ?? {}, body: match[2].trim(), raw };
}

export function readMarkdown(path: string): ParsedMarkdown {
	try {
		return parseFrontmatter(readFileSync(path, 'utf8'));
	} catch (error) {
		throw new Error(`${path}: ${(error as Error).message.split('\n')[0]}`);
	}
}

export const lineCount = (text: string) => text.replace(/\n$/, '').split('\n').length;
