// Copies the homepage benchmark chart from brand-dev-webapp into registry/ui/benchmark-chart.
// Usage: node scripts/port-benchmark.mjs <path to brand-dev-webapp>
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) throw new Error('Usage: node scripts/port-benchmark.mjs <path to brand-dev-webapp>');
const home = join(root, 'src', 'components', 'sections', 'home');
const out = join('registry', 'ui', 'benchmark-chart');
mkdirSync(out, { recursive: true });

const OVERRIDE_POSITION = ' // ds-override: chart position computed from the data, not layout spacing';

// Site classes to token classes. Order matters: longer, more specific patterns first.
const CLASS_MAP = [
	[/\btext-brand-primary\/85\b/g, 'text-brand/85'],
	[/\bborder-brand-primary\/70\b/g, 'border-brand/70'],
	[/\btext-brand-primary\b/g, 'text-brand'],
	[/\bborder-brand-primary\b/g, 'border-brand'],
	[/\bbg-brand-primary\b/g, 'bg-brand'],
	[/\bring-brand-primary\b/g, 'ring-focus'],
	[/\boutline-brand-primary\b/g, 'outline-focus'],
	[/\boutline-\[var\(--window-accent\)\]/g, 'outline-focus'],
	[/\bstroke-brand-neutral-70\/15\b/g, 'stroke-neutral-70/15'],
	[/\bstroke-brand-neutral-70\b/g, 'stroke-neutral-70'],
	[/\brounded-t-brand-section\b/g, 'rounded-t-card'],
	[/\brounded-brand-section\b/g, 'rounded-card'],
	[/\brounded-brand-card\b/g, 'rounded-card'],
	[/\btext-\[#9ca3af\]/g, 'text-fg-subtle'],
	[/\btext-\[#6b7280\]/g, 'text-neutral-60'],
	[/\btext-\[#4b5563\]/g, 'text-fg-muted'],
	[/\btext-\[#374151\]/g, 'text-neutral-80'],
	[/\bhover:text-\[#111827\]/g, 'hover:text-fg'],
	[/\btext-\[#111827\]/g, 'text-fg'],
	[/\bborder-\[#d1d5db\]/g, 'border-neutral-20'],
	[/\bborder-\[#cfcfcf\] bg-\[#cfcfcf\]/g, 'border-neutral-20 bg-neutral-20'],
	[/\bborder-\[#d6d6d6\]/g, 'border-neutral-20'],
	[/\bbg-\[#111827\]/g, 'bg-surface-inverse'],
	[/ shadow-\[0_1px_2px_rgba\(17,24,39,0\.08\)\]/g, ''],
	[/\bring-black\/\[0\.08\]/g, 'ring-line'],
	[/\bborder-black\/20\b/g, 'border-line-strong'],
	[/\bborder-black\/10\b/g, 'border-line'],
	[/\bhover:bg-black\/\[0\.03\]/g, 'hover:bg-surface-subtle'],
	[/\bbg-white\/85\b/g, 'bg-surface/85'],
	[/\bbg-white\b/g, 'bg-surface'],
	[/ tracking-\[0\.06em\]/g, ''],
	[/\bscrollbar-hide\b/g, '[scrollbar-width:none]'],
	[/font-data text-sm font-bold leading-none tabular-nums sm:text-base/g, 'font-data text-body-sm leading-none tabular-nums sm:text-body'],
	[/\btext-\[10px\]/g, 'text-caption'],
	[/\btext-\[11px\]/g, 'text-caption'],
	[/\btext-\[13px\]/g, 'text-body-sm'],
	[/ sm:text-\[11px\]/g, ''],
	[/ sm:text-xs\b/g, ''],
	[/\btext-sm\b/g, 'text-body-sm'],
	[/\btext-xs\b/g, 'text-caption'],
	// Chart gutters onto the spacing scale; the label column and its offsets move together.
	[/\bml-9\b/g, 'ml-8'],
	[/-left-9\b/g, '-left-8'],
	[/\bpr-14\b/g, 'pr-12'],
	[/\bmr-14\b/g, 'mr-12'],
	[/ml-\[6\.5rem\]/g, 'ml-24'],
	[/sm:ml-\[8\.5rem\]/g, 'sm:ml-32'],
	[/grid-cols-\[6\.5rem_/g, 'grid-cols-[6rem_'],
	[/sm:grid-cols-\[8\.5rem_/g, 'sm:grid-cols-[8rem_'],
];

const ARROW = `function ArrowRight({ className, ...props }: { className?: string; 'aria-hidden'?: boolean | 'true' }) {
	return (
		<svg viewBox="0 0 16 16" fill="none" className={className} {...props}>
			<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}`;

// The site's Context mark, static: the square with its hole and the disc beside it, drawn in the current color.
const MARK = `const LOGO_SQUARE = 'M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0Z';
const LOGO_HOLE = 'M260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z';

function ContextDevLogo({ className, style, ...props }: { className?: string; style?: CSSProperties; 'aria-hidden'?: boolean | 'true' }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 772.32 531.2" className={className} style={style} {...props}>
			<path fill="currentColor" fillRule="evenodd" d={LOGO_SQUARE + LOGO_HOLE} />
			<circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
		</svg>
	);
}`;

function common(text) {
	text = text.replace(/import \{ cn \} from '@\/lib\/utils';/g, "import { cx as cn } from '@/components/ds/ui/cx';");
	text = text.replace(/from '@\/components\/sections\/home\/competitor-benchmark-data'/g, "from '@/components/ds/ui/benchmark-data'");
	text = text.replace(/from '@\/components\/sections\/shared\/ring-backdrop'/g, "from '@/components/ds/ui/ring-backdrop'");
	text = text.replace(/^import Image from 'next\/image';\n/m, '').replace(/^import Link from 'next\/link';\n/m, '');
	text = text.replace(/<Image /g, '<img ').replace(/ unoptimized/g, '');
	text = text.replace(/<Link /g, '<a ').replace(/<\/Link>/g, '</a>');
	for (const [find, replace] of CLASS_MAP) text = text.replace(find, replace);
	return text;
}

// 1. Data: unchanged except a type for the panel's data prop.
let data = readFileSync(join(home, 'competitor-benchmark-data.ts'), 'utf8');
data += '\nexport type BenchmarkData = typeof BENCHMARKS;\n';
writeFileSync(join(out, 'benchmark-data.ts'), data);

// 2. The chart panel.
let chart = common(readFileSync(join(home, 'competitor-charts.tsx'), 'utf8'));
chart = chart.replace("import { ContextDevLogo } from '@/components/icons';\n", '');
chart = chart.replace("import { ArrowRight } from '@/lib/icons';\n", '');
chart = chart.replace("import { BENCHMARKS, PROVIDERS, type ProviderKey } from '@/components/ds/ui/benchmark-data';", "import { BENCHMARKS, PROVIDERS, type BenchmarkData, type ProviderKey } from '@/components/ds/ui/benchmark-data';");
chart = chart.replace(/import \{ useEffect, useRef, useState, (type FocusEvent[^}]*)\} from 'react';/, "import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, $1} from 'react';");
chart = chart.replace('const MONO = ', `${MARK}\n\n${ARROW}\n\n// The figures the charts draw: the bundled sample by default, or verified results passed to the panel.\nconst BenchmarkDataContext = createContext<BenchmarkData>(BENCHMARKS);\n\nconst MONO = `);
chart = chart.replace("'text-white' : 'text-brand'", "'text-on-brand' : 'text-brand'");
chart = chart.replace('<RingBackdrop color="rgb(37 99 235)"', '<RingBackdrop color="var(--ds-color-brand)"');
// Each chart reads the figures from context instead of the module, so verified data can be passed in.
for (const fn of ['SuccessChart', 'LatencyChart', 'CostChart']) {
	chart = chart.replace(new RegExp(`(function ${fn}\\(\\) \\{\\n\\tconst \\{ ref, shown \\} = useGrowIn\\(\\);)`), '$1\n\tconst data = useContext(BenchmarkDataContext);');
}
chart = chart.replace(/BENCHMARKS\.(successRate|latency|costVsSuccess)/g, 'data.$1');
// The panel takes the data and the comparison link as props.
chart = chart.replace('export function BenchmarkPanel() {', "export function BenchmarkPanel({ data = BENCHMARKS, sourceHref = '/compare/the-top-firecrawl-alternative', sourceLabel = 'See full comparisons' }: { data?: BenchmarkData; sourceHref?: string; sourceLabel?: string }) {");
chart = chart.replace('<a href="/compare/the-top-firecrawl-alternative" ', '<a href={sourceHref} ');
chart = chart.replace('\t\t\tSee full comparisons\n\t\t\t<ArrowRight', '\t\t\t{sourceLabel}\n\t\t\t<ArrowRight');
chart = chart.replace(
	'\treturn (\n\t\t<div ref={panelRef}',
	"\treturn (\n\t\t<BenchmarkDataContext.Provider value={data}>\n\t\t<style>{'@keyframes benchmark-tab-donut{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}'}</style>\n\t\t<div ref={panelRef}",
);
chart = chart.replace(/(\t\t\t\t<div className="mt-4 flex justify-center md:hidden">\{comparisonsLink\}<\/div>\n\t\t\t<\/div>\n\t\t<\/div>)\n\t\);\n\}\s*$/, '$1\n\t\t</BenchmarkDataContext.Provider>\n\t);\n}\n');
chart = chart.replace('<div className="brand-glass-ring">', '<div className="-m-2 rounded-card bg-tint p-2">');
// Positions on the plot come from the data; mark those inline styles for the spacing rule.
chart = chart
	.split('\n')
	.map((line) => {
		if (!/style=\{\{ (bottom|left): /.test(line) || line.includes('ds-override')) return line;
		const note = OVERRIDE_POSITION.replace(' // ', '');
		return line.trim().endsWith('>') ? `${line}{/* ${note} */}` : `${line} /* ${note} */`;
	})
	.join('\n');
writeFileSync(join(out, 'benchmark-chart.tsx'), chart);

// 3. The feature table the site shows in production while the figures are sample data. Ported without the water
// texture and frosted window (the retired ocean theme): a white ringed card in the brand tokens.
const comparison = readFileSync(join(home, 'competitor-comparison.tsx'), 'utf8');
const start = comparison.indexOf('const REVEAL_EASE');
const end = comparison.indexOf('// Sample benchmark numbers');
let grid = common(comparison.slice(start, end));
grid = grid.replace('function ComparisonGrid() {', 'export function BenchmarkComparison() {');
grid = grid.replace("<div className={cn(styles.window, styles.blue, 'scrollbar-hide overflow-x-auto')}>", '<div className="overflow-x-auto rounded-card border border-line bg-surface text-fg [scrollbar-width:none]">');
grid = grid.replace("<div className={cn(styles.window, styles.blue, '[scrollbar-width:none] overflow-x-auto')}>", '<div className="overflow-x-auto rounded-card border border-line bg-surface text-fg [scrollbar-width:none]">');
grid = grid.replace(/bg-\[var\(--window-bar\)\]/g, 'bg-surface-subtle');
grid = grid.replace('<span className={styles.highlightColumn} />', '<span className="bg-tint" />');
grid = grid.replace(/border-\[var\(--window-border\)\]/g, 'border-line');
grid = grid.replace(/text-\[var\(--window-accent\)\]/g, 'text-brand');
// A hollow dot reads as "no" in the brand's own language, and replaces the em dash the site used.
grid = grid.replace(/<span aria-hidden="true">—<\/span>/, '<span aria-hidden="true" className="inline-block size-2 rounded-full border border-neutral-30" />');
const header = `'use client';

import { cx as cn } from '@/components/ds/ui/cx';
import { domAnimation, LazyMotion, useInView, useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useRef } from 'react';

function Check({ className, ...props }: { className?: string; 'aria-label'?: string }) {
	return (
		<svg viewBox="0 0 16 16" fill="none" role="img" className={className} {...props}>
			<path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

`;
grid = `${header}${grid.trim()}\n`;
grid = grid.replace('export function BenchmarkComparison() {', 'function ComparisonGrid() {');
grid += `
/** Feature-by-feature comparison, sourced from the alternatives pages. Shown instead of the charts until the figures are verified. */
export function BenchmarkComparison() {
	return (
		<LazyMotion features={domAnimation}>
			<ComparisonGrid />
		</LazyMotion>
	);
}
`;
writeFileSync(join(out, 'benchmark-comparison.tsx'), grid);

// 4. Provider marks, each company's own, as the site serves them.
cpSync(join(root, 'public', 'benchmarks'), join(out, 'public', 'benchmarks'), { recursive: true });
// shadcn registry files are text, so raster logos are wrapped in an SVG that embeds them as a data URI.
for (const file of readdirSync(join(out, 'public', 'benchmarks')).filter((f) => /\.(png|jpe?g|webp)$/.test(f))) {
	const abs = join(out, 'public', 'benchmarks', file);
	const mime = file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
	const data = readFileSync(abs).toString('base64');
	writeFileSync(abs.replace(/\.(png|jpe?g|webp)$/, '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><image href="data:${mime};base64,${data}" width="48" height="48"/></svg>\n`);
	rmSync(abs);
	for (const f of readdirSync(out).filter((x) => /\.tsx?$/.test(x))) {
		const p = join(out, f);
		writeFileSync(p, readFileSync(p, 'utf8').split(`/benchmarks/${file}`).join(`/benchmarks/${file.replace(/\.(png|jpe?g|webp)$/, '.svg')}`));
	}
}
console.log('benchmark-chart: benchmark-chart.tsx, benchmark-data.ts, benchmark-comparison.tsx, public/benchmarks');
