// Copies the dot animation system from brand-dev-webapp into registry items.
// Usage: node scripts/port-dots.mjs <path to brand-dev-webapp>
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const src = join(process.argv[2], 'src', 'components', 'sections');
const list = (dir, re) => readdirSync(join(src, dir)).filter((f) => re.test(f) && !/\.test\./.test(f)).map((f) => `${dir}/${f}`);
const MANIFEST = {
	'dot-engine': ['shared/dot-morph-dots.ts', 'shared/dot-morph-goo.ts', 'shared/dot-morph-player.ts', 'shared/dot-glyph-cells.ts', 'shared/dot-glyph-morph.ts', 'shared/dot-svg-path.ts', 'shared/dot-story-player.ts', 'shared/dot-story-cells.ts', 'shared/dot-story-beats.ts', 'shared/logo-dot-sampling.ts', 'shared/use-hover-dot-morph.ts', 'shared/pause-when-offscreen.tsx', 'shared/hero-pattern-hole.ts'],
	'dot-story': ['shared/dot-story.tsx', 'shared/hero-circle-pattern.tsx', 'home/story-stage.tsx', 'products/story-caption.ts', 'products/style-guide-parts.ts', 'products/prompt-field.ts', ...list('home', /-story(-player|-scenes)?\.tsx?$/), ...list('products', /-story(-player|-scenes)?\.tsx?$/), ...list('.', /^faq-demo-(story|invite)/)],
	'ring-backdrop': ['shared/ring-backdrop.tsx'],
	'blog-cover': list('home', /^blog-cover-(art|dot-shader|morph-engine|morph|scenes)\.tsx?$/),
	'trust-mark': ['home/trust-mark.tsx', 'home/trust-mark-morph.ts', 'home/trust-marks.ts'],
	'customer-logo-dots': ['shared/customer-logo-dots.tsx', 'shared/customer-logo-grid.ts', 'shared/customer-logo-morph.ts'],
	'credits-dot-number': ['home/credits-dot-number.tsx'],
	'footer-watermark': ['shared/footer-watermark.tsx', 'shared/footer-watermark-dots.ts', 'shared/CursorClickIcon.tsx'],
	'hero-dot-field': ['shared/hero-dot-field.tsx', 'shared/hero-dot-logo-shape.ts', 'shared/hero-stat-morphs.tsx', 'shared/hero-stat-shapes.ts'],
	'announcement-dot-strip': ['shared/announcement-dot-strip.tsx'],
};

const ASSETS = {
	'blog-cover': ['blog-covers', 'agent-providers/claude.svg', 'agent-providers/cursor.svg'],
	'hero-dot-field': ['onboarding/tools/claude-color.svg', 'onboarding/tools/cursor-cube.svg', 'onboarding/tools/codex-color.svg'],
};
const publicDir = join(process.argv[2], 'public');
for (const [item, paths] of Object.entries(ASSETS)) {
	for (const rel of paths) cpSync(join(publicDir, rel), join('registry', 'ui', item, 'public', rel), { recursive: true });
	console.log(`${item}: assets ${paths.join(', ')}`);
}

const report = {};
for (const [item, files] of Object.entries(MANIFEST)) {
	const out = join('registry', 'ui', item);
	mkdirSync(out, { recursive: true });
	for (const rel of files) {
		const from = join(src, rel);
		if (!existsSync(from)) { (report.missing ??= []).push(rel); continue; }
		let text = readFileSync(from, 'utf8');
		text = text.replace(/from '@\/components\/sections\/(?:(?:shared|home|products)\/)?([^']+)'/g, "from '@/components/ds/ui/$1'");
		text = text.replace(/from '\.\/([^']+)'/g, "from '@/components/ds/ui/$1'");
		text = text.replace(/import\('@\/components\/sections\/(?:(?:shared|home|products)\/)?([^']+)'\)/g, "import('@/components/ds/ui/$1')");
		text = text.replace(/\btext-brand-primary\b/g, 'text-brand').replace(/var\(--color-brand-primary\)/g, 'var(--ds-color-brand)');
		text = text.replace(/import \{ cn \} from '@\/lib\/utils';/g, "import { cx as cn } from '@/components/ds/ui/cx';");
		text = text.replace("import type { Post } from '@/lib/blog';", 'type Post = { slug: string; title: string };');
		text = text.replace("import { env } from '@/lib/env';\n", '').replace('if (env.isDevelopment) console.error', "if (process.env.NODE_ENV !== 'production') console.error");
		for (const m of text.matchAll(/from '(@\/(?!components\/ds\/)[^']+)'/g)) (report[item] ??= new Set()).add(m[1]);
		writeFileSync(join(out, basename(rel)), text);
	}
	console.log(`${item}: ${files.length} files`);
}

const MASK = '// ds-override: offscreen luminance mask sampled into dot states, never painted';
const PATCHES = {
	'dot-engine/dot-story-player.ts': [
		["export const DOT_STORY_TEXT_COLOR = '#27272a';", "export const DOT_STORY_TEXT_COLOR = 'var(--ds-color-neutral-90)';"],
		["export const DOT_STORY_MUTED_TEXT_COLOR = '#52525b';", "export const DOT_STORY_MUTED_TEXT_COLOR = 'var(--ds-color-neutral-70)';"],
		["context.fillStyle = color ?? (muted ? DOT_STORY_MUTED_TEXT_COLOR : DOT_STORY_TEXT_COLOR);", "context.fillStyle = paintColor(context, color ?? (muted ? DOT_STORY_MUTED_TEXT_COLOR : DOT_STORY_TEXT_COLOR));"],
		["context.fillStyle = DOT_STORY_TEXT_COLOR;", "context.fillStyle = paintColor(context, DOT_STORY_TEXT_COLOR);"],
		[/^/, "import { paintColor } from '@/components/ds/ui/ds-color';\n"],
	],
	'dot-engine/dot-morph-dots.ts': [
		["context.fillStyle = palette.background;", "context.fillStyle = paintColor(context, palette.background);"],
		["context.fillStyle = palette.dots;", "context.fillStyle = paintColor(context, palette.dots);"],
		[/^/, "import { paintColor } from '@/components/ds/ui/ds-color';\n"],
	],
	'dot-engine/dot-morph-player.ts': [["context.strokeStyle = palette.dots;", "context.strokeStyle = paintColor(context, palette.dots);"], [/^/, "import { paintColor } from '@/components/ds/ui/ds-color';\n"]],
	'dot-engine/dot-story-beats.ts': [["context.fillStyle = surfaceColor;", "context.fillStyle = paintColor(context, surfaceColor);"], [/^/, "import { paintColor } from '@/components/ds/ui/ds-color';\n"]],
	'dot-engine/logo-dot-sampling.ts': [["context.fillStyle = background;", "context.fillStyle = paintColor(context, background);"], [/^/, "import { paintColor } from '@/components/ds/ui/ds-color';\n"]],
	'dot-engine/dot-glyph-morph.ts': [["\t\tcontext.fillStyle = cell.filled ? '#000' : '#fff';", `\t\t${MASK}\n\t\tcontext.fillStyle = cell.filled ? '#000' : '#fff';`]],
	'customer-logo-dots/customer-logo-morph.ts': [["\tcontext.strokeStyle = '#000';", `\t${MASK}\n\tcontext.strokeStyle = '#000';`]],
	'trust-mark/trust-mark-morph.ts': [["\tcontext.fillStyle = '#000';", `\t${MASK}\n\tcontext.fillStyle = '#000';`]],
	'blog-cover/blog-cover-scenes.ts': [[/^/, '// ds-override: grayscale luminance art drawn offscreen and sampled into dot states; these values are never painted\n']],
	'dot-story/dot-story.tsx': [
		["surfaceColor = '#FFFFFF'", "surfaceColor = 'var(--ds-color-bg-default)'"],
		["<path fill={surfaceColor} d={dotsPath(centresOf(resting.cells), haloRadius)} />", "<path style={{ fill: surfaceColor }} d={dotsPath(centresOf(resting.cells), haloRadius)} />"],
		["<path fill={surfaceColor} d={resting.clearedPath} />", "<path style={{ fill: surfaceColor }} d={resting.clearedPath} />"],
		["fill={muted ? DOT_STORY_MUTED_TEXT_COLOR : DOT_STORY_TEXT_COLOR}", "style={{ fill: muted ? DOT_STORY_MUTED_TEXT_COLOR : DOT_STORY_TEXT_COLOR }}"],
		["dotColor: style.color, surfaceColor,", "dotColor: style.color, surfaceColor: resolveColor(canvas, surfaceColor),"],
		[/^('use client';\n)/, "$1\nimport { resolveColor } from '@/components/ds/ui/ds-color';"],
	],
	'dot-story/hero-circle-pattern.tsx': [
		["color: 'white',", "color: 'var(--ds-color-white)',"],
		['<path fill="none" stroke={toneStyle.color}', '<path fill="none" style={{ stroke: toneStyle.color }}'],
		[/<path fill=\{toneStyle\.color\} (mask=\{`url\(#\$\{maskId\}\)`\} className="[^"]*") style=\{\{ opacity:/, '<path $1 style={{ fill: toneStyle.color, opacity:'],
		[/<path fill=\{toneStyle\.color\} /g, '<path style={{ fill: toneStyle.color }} '],
	],
	'dot-story/story-stage.tsx': [['sm:px-9', 'sm:px-8']],
	'dot-story/autofill-story-scenes.ts': [["\tformField('Brand color', '#5E6AD2'", "\t// ds-override: example output data, the Linear brand color the story shows being extracted\n\tformField('Brand color', '#5E6AD2'"]],
	'dot-story/assets-story-scenes.ts': [[/^/, '// ds-override: example output data, a third-party palette the story shows being extracted\n']],
	'ring-backdrop/ring-backdrop.tsx': [['<path d={path} fill="none" stroke={color} strokeOpacity={opacity}', '<path d={path} fill="none" style={{ stroke: color }} strokeOpacity={opacity}']],
	'blog-cover/blog-cover-art.tsx': [
		["paper: { background: '#FFFFFF', dots: '#2563EB' },", "paper: { background: 'var(--ds-color-bg-default)', dots: 'var(--ds-color-brand)' },"],
		["blue: { background: '#2563EB', dots: '#FFFFFF' },", "blue: { background: 'var(--ds-color-brand)', dots: 'var(--ds-color-white)' },"],
		["const colour = encodeURIComponent(BLOG_CARD_PALETTES[surface].dots);", "const colour = 'black';"],
		[/(export function backdropTile\(surface: BlogCardSurface\) \{)/, "// Used as a mask: the ring's color comes from the element's background-color, so tokens apply.\nexport function backdropStyle(surface: BlogCardSurface) {\n\tconst tile = backdropTile(surface);\n\treturn { backgroundColor: BLOG_CARD_PALETTES[surface].dots, maskImage: tile, WebkitMaskImage: tile, maskRepeat: 'space', WebkitMaskRepeat: 'space' } as const;\n}\n\n$1"],
	],
	'customer-logo-dots/customer-logo-dots.tsx': [
		["const dotColor = tone === 'onWhite' ? 'currentColor' : 'white';", "const dotColor = tone === 'onWhite' ? 'currentColor' : 'var(--ds-color-white)';"],
		["palette: { dots: tone === 'onWhite' ? getComputedStyle(canvas).color : 'white',", "palette: { dots: tone === 'onWhite' ? getComputedStyle(canvas).color : 'var(--ds-color-white)',"],
		[/stroke=\{dotColor\}/g, 'style={{ stroke: dotColor }}'],
		[/fill=\{dotColor\}/g, 'style={{ fill: dotColor }}'],
		['rounded-2xl', 'rounded-window'],
	],
	'footer-watermark/footer-watermark.tsx': [
		["const SOLID_DOT_COLOR = '#FFFFFF';", "const SOLID_DOT_COLOR = 'var(--ds-color-white)';"],
		["const RING_COLOR = 'rgba(255, 255, 255, 0.55)';", "const RING_COLOR = 'var(--ds-color-white)';\nconst RING_OPACITY = 0.55;"],
		['<path d={layer.rings} fill="none" stroke={RING_COLOR} strokeWidth={ringStroke} />', '<path d={layer.rings} fill="none" style={{ stroke: RING_COLOR }} strokeOpacity={RING_OPACITY} strokeWidth={ringStroke} />'],
		['<path d={layer.solids} fill={SOLID_DOT_COLOR} />', '<path d={layer.solids} style={{ fill: SOLID_DOT_COLOR }} />'],
		[' tracking-tighter', ''],
		["fontFamily: 'var(--font-rethink-sans), system-ui, sans-serif'", "fontFamily: 'var(--ds-font-sans)'"],
		["fontWeight: '500'", "fontWeight: 'var(--ds-font-weight-medium)'"],
		['<rect x="-1000" y="-1000" width="2000" height="2000" fill="white" />', '{/* ds-override: mask luminance, never painted */}\n\t\t\t\t\t\t<rect x="-1000" y="-1000" width="2000" height="2000" fill="white" />'],
	],
	'footer-watermark/CursorClickIcon.tsx': [
		["color = '#268BFF'", "color = 'var(--ds-color-brand)'"],
		[/fill="#0D0D0F"/g, "style={{ fill: 'var(--ds-color-black)' }}"],
		[/stroke="#0D0D0F"/g, "style={{ stroke: 'var(--ds-color-black)' }}"],
		[/stroke=\{color\}/g, 'style={{ stroke: color }}'],
		[/fill=\{color\}/g, 'style={{ fill: color }}'],
	],
	'dot-story/type-story-scenes.ts': [[/(\{ hex: '#[0-9A-F]{6}', role: '[a-z]+', tone: [a-zA-Z]+ \},)/g, '$1 // ds-override: example output data, a third-party palette shown being extracted']],
	'hero-dot-field/hero-dot-field.tsx': [[/^(const LIVELY_CENTRE_FADE)/m, '// ds-override: mask-image luminance ramp, never painted\n$1']],
	'hero-dot-field/hero-stat-morphs.tsx': [['text-xs', 'text-caption'], [/--marketing-content-width/g, '--ds-layout-content-width']],
};

for (const [file, edits] of Object.entries(PATCHES)) {
	const path = join('registry', 'ui', file);
	let text = readFileSync(path, 'utf8');
	for (const [find, replace] of edits) {
		const before = text;
		text = typeof find === 'string' ? text.split(find).join(replace) : text.replace(find, replace);
		if (before === text) console.warn(`patch did not apply: ${file}: ${String(find).slice(0, 60)}`);
	}
	writeFileSync(path, text);
}

// Regenerates the DotScene selector and the scene table in dot-story/docs.md from the ported stories.
{
	const dir = join('registry', 'ui', 'dot-story');
	const stories = readdirSync(dir).filter((f) => f.endsWith('-story.tsx') && f !== 'dot-story.tsx').sort().map((f) => {
		const text = readFileSync(join(dir, f), 'utf8');
		const name = f.replace(/-story\.tsx$/, '');
		const exportName = text.match(/export function (\w+)/)[1];
		const doc = (text.match(/\/\*\*\s*([\s\S]*?)\*\//)?.[1] ?? '').replace(/\s*\n\s*\*\s*/g, ' ').trim();
		const shows = (doc.split(/(?<=[.:])\s/)[0] ?? '').replace(/[.:]$/, '').replace(/^The /, '').replace(/'s picture/, '').replace(/ card/, '').replace(/"/g, '');
		return { name, exportName, shows };
	});
	const tsx = ["import type { ComponentType } from 'react';", ...stories.map((s) => `import { ${s.exportName} } from '@/components/ds/ui/${s.name}-story';`), '', 'const SCENES = {', ...stories.map((s) => `\t'${s.name}': ${s.exportName},`), '} satisfies Record<string, ComponentType<{ className?: string }>>;', '', 'export type DotSceneName = keyof typeof SCENES;', 'export const DOT_SCENES = Object.keys(SCENES) as DotSceneName[];', '', 'export function DotScene({ variant, className }: { variant: DotSceneName; className?: string }) {', '\tconst Scene = SCENES[variant];', '\treturn <Scene className={className} />;', '}', ''].join('\n');
	writeFileSync(join(dir, 'dot-scene.tsx'), tsx);
	const docsPath = join(dir, 'docs.md');
	let docs = readFileSync(docsPath, 'utf8');
	docs = docs.replace(/^variants: \[.*\]$/m, `variants: [${stories.map((s) => s.name).join(', ')}]`);
	docs = docs.replace(/\| Scene \| Shows \|\n\|---\|---\|\n[\s\S]*$/, `| Scene | Shows |\n|---|---|\n${stories.map((s) => `| \`${s.name}\` | ${s.shows} |`).join('\n')}\n`);
	writeFileSync(docsPath, docs);
	console.log(`dot-scene: ${stories.length} scenes`);
}

for (const [k, v] of Object.entries(report)) console.log(`external in ${k}:`, [...v]);
