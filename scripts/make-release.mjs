// Builds the release tree apps install from: compiled, no dev dependencies, no source or intake. Installing a git
// branch otherwise clones the whole repo and compiles it on every machine, which takes minutes.
// usage: node scripts/make-release.mjs <out-dir>
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = process.argv[2];
if (!out) throw new Error('usage: node scripts/make-release.mjs <out-dir>');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of ['bin.js', 'dist', 'build', 'brand', 'README.md']) cpSync(join(root, p), join(out, p), { recursive: true });
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
delete pkg.devDependencies;
pkg.scripts = {};
writeFileSync(join(out, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`release tree in ${out}`);
