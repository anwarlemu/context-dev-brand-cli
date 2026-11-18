// Bundles the reel (brand/assets/reel: the playground's tiles and camera) into build/assets/reel.js with React, so
// the video command can open it in headless Chromium without the app's source or dependencies.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';

const root = new URL('../..', import.meta.url).pathname;
const out = join(root, 'build', 'assets');
mkdirSync(out, { recursive: true });
await build({
	entryPoints: [join(root, 'brand', 'assets', 'reel', 'entry.tsx')],
	bundle: true,
	format: 'iife',
	minify: true,
	jsx: 'automatic',
	platform: 'browser',
	define: { 'process.env.NODE_ENV': '"production"' },
	outfile: join(out, 'reel.js'),
	logLevel: 'warning',
});
copyFileSync(join(root, 'brand', 'assets', 'reel', 'reel.css'), join(out, 'reel.css'));
console.log('reel: build/assets/reel.js');
