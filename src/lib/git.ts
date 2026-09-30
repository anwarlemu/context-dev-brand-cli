import { execFileSync } from 'node:child_process';

export function changedFiles(root: string): string[] {
	try {
		const out = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
		return out.split('\n').filter(Boolean).filter((l) => !l.startsWith(' D') && !l.startsWith('D ')).map((l) => l.slice(3).split(' -> ').pop()!.replace(/^"|"$/g, ''));
	} catch {
		return [];
	}
}

export function gitDiff(root: string, paths: string[] = []): string {
	try {
		return execFileSync('git', ['diff', 'HEAD', '--', ...paths], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 20 * 1024 * 1024 });
	} catch {
		return '';
	}
}
