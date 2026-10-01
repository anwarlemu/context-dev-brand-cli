// Copies the homepage hero demo input from brand-dev-webapp into registry/ui/demo-input.
// Usage: node scripts/port-demo.mjs <path to brand-dev-webapp>
// The site version calls Firebase, posthog and the Next router; the port submits by navigating to an `action` URL.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) throw new Error('Usage: node scripts/port-demo.mjs <path to brand-dev-webapp>');
const src = join(root, 'src', 'components');
const out = join('registry', 'ui', 'demo-input');
mkdirSync(out, { recursive: true });

// source path -> file name in the registry item
const FILES = {
	'sections/home/quick-demo-input.tsx': 'demo-input.tsx',
	'sections/home/hero-demo-jobs.ts': 'hero-demo-jobs.ts',
	'sections/home/use-tab-glide.ts': 'use-tab-glide.ts',
	'ui/glide-hover.tsx': 'glide-hover.tsx',
};

const FOCUS = "'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'";
const ICONS = `function ArrowRight({ className }: { className?: string }) {
	return (
		<svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
			<path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function Globe({ className }: { className?: string }) {
	return (
		<svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
			<circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<path d="M2.75 10h14.5M10 2.75c2 2 3 4.5 3 7.25s-1 5.25-3 7.25c-2-2-3-4.5-3-7.25s1-5.25 3-7.25Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

function Spinner({ className }: { className?: string }) {
	return (
		<svg aria-label="Loading" viewBox="0 0 20 20" className={className}>
			<path d="M10 2.75a7.25 7.25 0 1 0 7.25 7.25" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
		</svg>
	);
}

function useReducedMotion() {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		setReduced(query.matches);
		const change = () => setReduced(query.matches);
		query.addEventListener('change', change);
		return () => query.removeEventListener('change', change);
	}, []);
	return reduced;
}

function useIsMobile() {
	const [mobile, setMobile] = useState(false);
	useEffect(() => {
		const query = window.matchMedia('(max-width: 767px)');
		setMobile(query.matches);
		const change = () => setMobile(query.matches);
		query.addEventListener('change', change);
		return () => query.removeEventListener('change', change);
	}, []);
	return mobile;
}
`;

const PATCHES = {
	'demo-input.tsx': [
		["import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';", "import { useEffect, useMemo, useRef, useState } from 'react';"],
		["import { FOCUS_VISIBLE_CLASS } from '@/components/ui/focus-styles';\n", ''],
		["import { GlideHover } from '@/components/ui/glide-hover';", "import { GlideHover } from '@/components/ds/ui/glide-hover';"],
		["import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';\n", ''],
		["import { useServerSessionActive } from '@/hooks/useServerSessionActive';\n", ''],
		["import { useIsMobile } from '@/hooks/use-mobile';\n", ''],
		["import { ArrowRight, Globe, Loader2 } from '@/lib/icons';\n", ''],
		["import { useReducedMotion } from 'motion/react';\n", ''],
		["import { useRouter } from 'next/navigation';\n", ''],
		["import posthog from 'posthog-js';\n", ''],
		['const TYPE_SPEED = 80;', `const FOCUS_VISIBLE_CLASS = ${FOCUS};\n\n${ICONS}\nconst TYPE_SPEED = 80;`],
		["'size-4 shrink-0 transition-colors duration-[140ms] ease-out motion-reduce:transition-none', isActive ? 'text-brand' : 'text-black/40'", "'size-4 shrink-0 transition-colors duration-150 ease-out motion-reduce:transition-none', isActive ? 'text-brand' : 'text-fg-subtle'"],
		[`						<div
							className="rounded-brand-card px-3 py-2 whitespace-nowrap"
							style={{
								background: 'rgba(255,255,255,0.95)',
								backdropFilter: 'blur(8px)',
								WebkitBackdropFilter: 'blur(8px)',
								border: '1px solid rgba(0,0,0,0.08)',
								boxShadow: '0 0.5rem 2rem -0.25rem rgba(0,0,0,0.12), 0 0.25rem 0.75rem -0.125rem rgba(0,0,0,0.08)',
							}}
						>
							<span className="text-[0.8125rem] font-medium text-black/70">{content}</span>
						</div>
						{/* Arrow */}
						<div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-1.5 overflow-hidden">
							<div className="w-2.5 h-2.5 rotate-45 -translate-y-[60%] mx-auto" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)' }} />
						</div>`, `						<div className="whitespace-nowrap rounded-card border border-line bg-surface px-3 py-2">
							<span className="text-body-sm text-fg-muted">{content}</span>
						</div>`],
		["className={cn('fixed transition-all duration-150', open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}", "className={cn('fixed transition-opacity duration-150 ease-out', open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}"],
		["const SCROLLABLE_TAB_ROW = 'overflow-x-auto overscroll-x-contain scrollbar-hide touch-pan-x [-webkit-overflow-scrolling:touch]';", "const SCROLLABLE_TAB_ROW = 'overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:none] [-webkit-overflow-scrolling:touch]';"],
		["export function QuickDemoInput() {", "export type DemoInputProps = {\n\t/** Where a run goes, with the job and what was typed as search params. */\n\taction?: string;\n};\n\nexport function DemoInput({ action = '/signup' }: DemoInputProps) {"],
		[`	// The hero tint keys off this attribute on <html> (see globals.css), so a switch restyles only the tinted elements.
	// Layout effect: the tint starts in the same frame as the tab pill's glide.
	useLayoutEffect(() => {
		document.documentElement.dataset.heroJob = jobId;
	}, [jobId]);
	useEffect(() => () => void delete document.documentElement.dataset.heroJob, []);
`, ''],
		["	const router = useRouter();\n", ''],
		[`	// Running needs an account. Signed in is either signal the header trusts: the Firebase SDK or the server session.
	const [firebaseUser] = useFirebaseAuthUser();
	const hasServerSession = useServerSessionActive();
	const isSignedIn = Boolean(firebaseUser) || hasServerSession;
`, ''],
		[`	const handleInputFocus = () => {
		// Warm the /demo route segment as soon as the user engages the input. A cold navigation to this
		// dynamic, un-prefetched route leaves Next's App Router state as a pending Promise, which trips a
		// framework-internal hooks-count divergence (React #310) in useActionQueue/useOptimistic on submit.
		// Prefetching shrinks that suspend window; the real fix is an upstream Next.js patch.
		router.prefetch(isSignedIn ? '/demo' : '/signup');
	};
`, ''],
		["		const destination = buildHeroDestination(job, value.trim() || examples[0]);", "		const destination = buildHeroDestination(job, value.trim() || examples[0], action);"],
		[`		// Signed out: sign up first, and sign-up hands back to the same run, which then starts on its own.
		if (!isSignedIn) {
			destination.href = \`/signup?return_to=\${encodeURIComponent(destination.href)}\`;
			destination.surface = 'signup';
		}
		isSubmitting.current = true;
		setIsNavigating(true);
		router.push(destination.href);
		// Fire-and-forget analytics — must never delay or block navigation.
		try {
			posthog.capture('homepage_demo_submit', { domain: destination.value, source: 'homepage_widget', tab: job.id, job: job.id, destination: destination.surface });
		} catch {
			// Analytics failures are non-fatal.
		}`, `		isSubmitting.current = true;
		setIsNavigating(true);
		window.location.assign(destination.href);`],
		["							onFocus={handleInputFocus}\n", ''],
		['<div className="brand-glass-ring w-[calc(100%+1rem)] max-w-[53rem] rounded-[1.75rem] [background:var(--hero-demo-ring,var(--color-brand-blue-80))]">', '<div className="w-full max-w-3xl rounded-window bg-blue-80 p-2">'],
		['className="relative flex w-full flex-col overflow-hidden rounded-[1.25rem] bg-white"', 'className="relative flex w-full flex-col overflow-hidden rounded-window bg-surface"'],
		['<div className="flex shrink-0 px-[10px] pt-[10px] md:px-[12px] md:pt-[12px]">', '<div className="flex shrink-0 px-2.5 pt-2.5 md:px-3 md:pt-3">'],
		["className={cn('relative flex min-w-0 items-center rounded-[0.75rem] bg-black/[0.04] p-[4px]', SCROLLABLE_TAB_ROW)}", "className={cn('relative flex min-w-0 items-center rounded-window bg-surface-subtle p-1', SCROLLABLE_TAB_ROW)}"],
		['highlightClassName="rounded-[0.5rem] bg-white/60"', 'highlightClassName="rounded-card bg-white/60"'],
		["className={cn('pointer-events-none absolute left-0 top-0 -z-10 rounded-[0.5rem] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]', !isPillReady && 'invisible')}", "className={cn('pointer-events-none absolute left-0 top-0 -z-10 rounded-card bg-surface ring-1 ring-line', !isPillReady && 'invisible')}"],
		["className={cn('relative flex h-[38px] shrink-0 cursor-pointer select-none items-center gap-[7px] rounded-[0.5rem] pl-[9px] pr-[11px]', FOCUS_VISIBLE_CLASS, isActive && !isPillReady && 'bg-white')}", "className={cn('relative flex h-10 shrink-0 cursor-pointer select-none items-center gap-2 rounded-card pl-2.5 pr-3', FOCUS_VISIBLE_CLASS, isActive && !isPillReady && 'bg-surface')}"],
		["className={cn('flex whitespace-nowrap text-[14px] leading-[22px] transition-colors duration-[140ms] ease-out motion-reduce:transition-none', isActive ? 'text-black' : 'text-black/50')}", "className={cn('flex whitespace-nowrap text-body-sm transition-colors duration-150 ease-out motion-reduce:transition-none', isActive ? 'text-fg' : 'text-fg-muted')}"],
		['<div className="relative flex h-[64px] shrink-0 items-center gap-3 pr-[10px] md:h-[68px] md:pr-[12px]">', '<div className="relative flex h-16 shrink-0 items-center gap-3 pr-2.5 md:pr-3">'],
		[`<label className="flex min-w-0 flex-1 cursor-text items-center gap-[12px] px-[20px] before:absolute before:inset-0 before:cursor-text before:content-[''] md:px-[22px]">`, `<label className="flex min-w-0 flex-1 cursor-text items-center gap-3 px-5 before:absolute before:inset-0 before:cursor-text before:content-[''] md:px-6">`],
		['<Globe aria-hidden className="relative size-5 shrink-0 text-black/40" />', '{/* ds-override: decorative icon, a UI part at 3.95:1 (3:1 required), not text */}\n\t\t\t\t\t\t<Globe className="relative size-5 shrink-0 text-fg-subtle" />'],
		['<GlideHover className="flex items-center gap-[2px]"', '<GlideHover className="flex items-center gap-0.5"'],
		['className="relative min-w-0 flex-1 bg-transparent py-0 font-data text-[18px] font-bold leading-[1.5] tracking-normal text-black placeholder:text-black/45 focus-visible:outline-none disabled:opacity-60 md:text-[19px]"', 'className="relative min-w-0 flex-1 bg-transparent py-0 font-data text-body-lg text-fg placeholder:text-fg-subtle focus-visible:outline-none disabled:opacity-60"'],
		['{/* will-change keeps the button on its own layer, so the hover brightness never re-rasterizes the icon onto a different pixel. */}\n', ''],
		['className="relative isolate flex h-[46px] w-[56px] shrink-0 cursor-pointer items-center justify-center rounded-[0.75rem] bg-brand-primary text-white transition-[filter] duration-150 ease-out will-change-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none md:w-[64px]"', 'className="relative isolate flex h-12 w-14 shrink-0 cursor-pointer items-center justify-center rounded-window bg-brand text-on-brand transition-colors duration-150 ease-out hover:bg-navy-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none md:w-16"'],
		['{isNavigating ? <Loader2 className="size-5 animate-spin" aria-label="Loading demo" /> : <ArrowRight className="size-5" aria-hidden />}', '{isNavigating ? <Spinner className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}'],
		['<p role="alert" className="px-[20px] pb-[12px] text-[0.8125rem] font-medium text-red-600">', '<p role="alert" className="px-5 pb-3 text-body-sm text-danger">'],
	],
	'hero-demo-jobs.ts': [
		[`import type { DemoJobId } from '@/components/demo/demoTypes';
import { looksLikeUrl, normalizeBareBrandName } from '@/lib/url-validation';

export type HeroJobId = DemoJobId;`, `export type HeroJobId = 'scrape' | 'search' | 'answers' | 'crawl' | 'map' | 'brand';

const looksLikeUrl = (value: string) => /^[^\\s/]+\\.[a-z]{2,}(?:[/?#]\\S*)?$/i.test(value);
const normalizeBareBrandName = (value: string) => (/^[a-z0-9-]+$/i.test(value) ? \`\${value.toLowerCase()}.com\` : null);`],
		['export interface HeroDestination {\n\thref: string;\n\tsurface: \'demo\' | \'signup\';\n\tvalue: string;\n}', 'export interface HeroDestination {\n\thref: string;\n\tvalue: string;\n}'],
		[/\/\*\*\n \* The \/demo run[\s\S]*?\*\/\n/, '/** Where a run goes: the action URL with the job, what was typed and the panel\'s choices as search params. */\n'],
		["export function buildHeroDestination(job: HeroJob, raw: string, choices: { option?: string; formats?: string[] } = {}): HeroDestination | null {", "export function buildHeroDestination(job: HeroJob, raw: string, action: string, choices: { option?: string; formats?: string[] } = {}): HeroDestination | null {"],
		["	params.set('autoFetch', 'true');\n	return { href: `/demo?${params}`, surface: 'demo', value };", "	const joiner = action.includes('?') ? '&' : '?';\n	return { href: `${action}${joiner}${params}`, value };"],
	],
	'use-tab-glide.ts': [["import { boxWithin, type HighlightBox } from '@/components/ui/glide-hover';", "import { boxWithin, type HighlightBox } from '@/components/ds/ui/glide-hover';"]],
	'glide-hover.tsx': [
		["import { domAnimation, LazyMotion, useReducedMotion, type Transition } from 'motion/react';\nimport * as m from 'motion/react-m';\n", ''],
		["export const SPRING_GLIDE_TRANSITION: Transition = { type: 'spring', visualDuration: 0.34, bounce: 0 };\n\n", ''],
		[/\t\/\*\* Glides with this Motion transition[\s\S]*?glideTransition\?: Transition;\n/, ''],
		['export function GlideHover({ children, className, highlightClassName, glideTransition }: GlideHoverProps) {', 'export function GlideHover({ children, className, highlightClassName }: GlideHoverProps) {'],
		['			{box && glideTransition && <MotionHighlight box={box} isVisible={isVisible} isGliding={isGliding} glideTransition={glideTransition} className={highlightClassName} />}\n', ''],
		['			{box && !glideTransition && (', '			{box && ('],
		["isGliding ? 'transition-[translate,width,height,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]' : 'transition-opacity duration-150 ease-out',", "isGliding ? 'transition-[translate,width,height,opacity] duration-200 ease-emphasized' : 'transition-opacity duration-150 ease-out',"],
		[/\nconst INSTANT_TRANSITION[\s\S]*$/, '\n'],
	],
};

for (const [from, to] of Object.entries(FILES)) {
	const path = join(src, from);
	if (!existsSync(path)) throw new Error(`missing ${path}`);
	let text = readFileSync(path, 'utf8');
	text = text.replace(/from '@\/components\/sections\/(?:(?:shared|home|products)\/)?([^']+)'/g, "from '@/components/ds/ui/$1'");
	text = text.replace(/import \{ cn \} from '@\/lib\/utils';/g, "import { cx as cn } from '@/components/ds/ui/cx';");
	text = text.replace(/\btext-brand-primary\b/g, 'text-brand');
	for (const [find, replace] of PATCHES[to] ?? []) {
		const before = text;
		text = typeof find === 'string' ? text.split(find).join(replace) : text.replace(find, replace);
		if (before === text && find !== replace) console.warn(`patch did not apply: ${to}: ${String(find).slice(0, 70)}`);
	}
	for (const m of text.matchAll(/from '(@\/(?!components\/ds\/)[^']+|motion[^']*|posthog[^']*|next\/[^']+)'/g)) console.warn(`external import left in ${to}: ${m[1]}`);
	writeFileSync(join(out, to), text);
	console.log(`demo-input: ${from} -> ${to}`);
}
