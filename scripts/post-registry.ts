import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/r';
const local = 'public/r-local';
mkdirSync(local, { recursive: true });
for (const file of readdirSync(out).filter((f) => f.endsWith('.json') && !f.includes('@') && f !== 'registry.json')) {
	const item = JSON.parse(readFileSync(join(out, file), 'utf8'));
	const version = item.meta?.version;
	if (version) writeFileSync(join(out, `${item.name}@${version}.json`), JSON.stringify(item, null, 2));
	delete item.registryDependencies;
	writeFileSync(join(local, file), JSON.stringify(item, null, 2));
}
console.log('public/r versioned copies and public/r-local written');
