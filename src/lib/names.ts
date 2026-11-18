// Names as people type them: `AlertDialog`, `alert-dialog`, `alert_dialog` and `Alert Dialog` are one name.

export const normalizeName = (name: string) => name.toLowerCase().replace(/\.(vue|ts|js)$/, '').replace(/[^a-z0-9]/g, '');

function distance(a: string, b: string) {
	const row = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let prev = i - 1;
		row[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const cur = row[j];
			row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
			prev = cur;
		}
	}
	return row[b.length];
}

/** The closest names to what was typed, best first. */
export function suggest(typed: string, pool: string[], max = 3): string[] {
	const t = normalizeName(typed);
	const scored = [...new Set(pool)].filter((name) => normalizeName(name)).map((name) => {
		const n = normalizeName(name);
		const d = n.includes(t) || t.includes(n) ? Math.abs(n.length - t.length) * 0.3 : distance(t, n);
		return { name, d };
	});
	return scored
		.filter((s) => s.d <= Math.max(2, t.length * 0.4))
		.sort((a, b) => a.d - b.d || a.name.length - b.name.length)
		.slice(0, max)
		.map((s) => s.name);
}

/** The error for a name that is not in a list: exits 1 through the CLI, with the nearest names and the full list. */
export function unknownName(what: string, typed: string, pool: string[]): Error {
	const near = suggest(typed, pool);
	return Object.assign(new Error(`Unknown ${what} \`${typed}\`.${near.length ? ` Did you mean ${near.map((n) => `\`${n}\``).join(' or ')}?` : ''} Choose from: ${pool.join(', ')}.`), { suggestions: near, choices: pool });
}
