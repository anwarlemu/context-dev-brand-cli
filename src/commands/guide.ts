import { readFileSync } from 'node:fs';
import { brand, cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { pkgPath } from '../lib/paths.js';

export function agentGuide() {
	const b = brand();
	return readFileSync(pkgPath('brand', 'agent-guide.md'), 'utf8')
		.replaceAll('{{brand}}', b.name).replaceAll('{{bin}}', b.bin).replaceAll('{{cli}}', cli())
		.replaceAll('{{source}}', b.source).replaceAll('{{url}}', b.registryUrl ?? '');
}

export function guide(opts: { json?: boolean }) {
	const b = brand();
	emit(opts, { schemaVersion: 1, name: b.name, command: b.bin, guide: agentGuide(), resources: { guide: `${b.registryUrl}/agents.md`, index: `${b.registryUrl}/r/index.json`, components: `${b.registryUrl}/components/{name}.md`, references: `${b.registryUrl}/reference-audit.json` } }, agentGuide);
}
