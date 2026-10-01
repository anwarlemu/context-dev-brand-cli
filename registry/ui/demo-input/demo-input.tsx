'use client';

import { buildHeroDestination, DEFAULT_HERO_JOB, getHeroJob, HERO_JOBS, stripProtocol, type HeroInputKind, type HeroJobId } from '@/components/ds/ui/hero-demo-jobs';
import { GlideHover } from '@/components/ds/ui/glide-hover';
import { useTabGlide } from '@/components/ds/ui/use-tab-glide';
import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FOCUS_VISIBLE_CLASS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

function ArrowRight({ className }: { className?: string }) {
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

const TYPE_SPEED = 80;
const DELETE_SPEED = 40;
const PAUSE_DURATION = 2000;

// Each job drawn in a 5 × 5 grid of dots, in the hero's dot language: 2 is a solid dot, 1 a hollow ring.
const JOB_GLYPHS: Record<HeroJobId, readonly string[]> = {
	scrape: ['22222', '.....', '2222.', '.....', '222..'],
	crawl: ['2...2', '.1.1.', '..2..', '.1.1.', '2...2'],
	map: ['22...', '1....', '1.222', '1....', '1.222'],
	search: ['.22..', '2..2.', '.22..', '...1.', '....2'],
	answers: ['..2..', '..1..', '21.12', '..1..', '..2..'],
	brand: ['22.22', '2...2', '..2..', '2...2', '22.22'],
};
const GLYPH_PITCH = 3.2;
const GLYPH_DOT_RADIUS = 1.25;
const GLYPH_RING_STROKE = 0.55;

function JobGlyph({ id, isActive }: { id: HeroJobId; isActive: boolean }) {
	return (
		<svg aria-hidden="true" viewBox={`0 0 ${GLYPH_PITCH * 5} ${GLYPH_PITCH * 5}`} className={cn('size-4 shrink-0 transition-colors duration-150 ease-out motion-reduce:transition-none', isActive ? 'text-brand' : 'text-fg-subtle')}>
			{JOB_GLYPHS[id].flatMap((row, y) =>
				[...row].map((cell, x) => {
					if (cell === '.') return null;
					const isSolid = cell === '2';
					return <circle key={`${x}:${y}`} cx={(x + 0.5) * GLYPH_PITCH} cy={(y + 0.5) * GLYPH_PITCH} r={isSolid ? GLYPH_DOT_RADIUS : GLYPH_DOT_RADIUS - GLYPH_RING_STROKE / 2} fill={isSolid ? 'currentColor' : 'none'} stroke={isSolid ? 'none' : 'currentColor'} strokeWidth={GLYPH_RING_STROKE} />;
				})
			)}
		</svg>
	);
}

const INPUT_LABELS: Record<HeroInputKind, string> = {
	url: 'Enter a URL or domain to try the demo',
	query: 'Enter a search query',
	question: 'Ask a research question',
};

function inputError(kind: HeroInputKind, example: string): string {
	if (kind === 'url') return `Enter a URL or domain like "${example}"`;
	return kind === 'query' ? 'Type a search query first' : 'Type a question first';
}

function TabHoverPopover({ children, content }: { children: React.ReactNode; content: string }) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const triggerRef = useRef<HTMLDivElement>(null);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const handleEnter = () => {
		clearTimeout(timeoutRef.current);
		if (open) return;
		timeoutRef.current = setTimeout(() => {
			if (!triggerRef.current) return;
			const rect = triggerRef.current.getBoundingClientRect();
			setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
			setOpen(true);
		}, 500);
	};
	const handleLeave = () => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setOpen(false), 150);
	};

	return (
		<div ref={triggerRef} className="shrink-0" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
			{children}
			{pos &&
				createPortal(
					<div
						className={cn('fixed transition-opacity duration-150 ease-out', open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
						style={{
							zIndex: 99999,
							top: pos.top,
							left: pos.left,
							transform: `translate(-50%, -100%)${open ? '' : ' translateY(4px)'}`,
						}}
						onMouseEnter={handleEnter}
						onMouseLeave={handleLeave}
					>
						<div className="whitespace-nowrap rounded-card border border-line bg-surface px-3 py-2">
							<span className="text-body-sm text-fg-muted">{content}</span>
						</div>
					</div>,
					document.body
				)}
		</div>
	);
}

function DesktopTabHoverPopover({ children, content, isMobile }: { children: React.ReactNode; content: string; isMobile: boolean }) {
	if (isMobile) return children;

	return <TabHoverPopover content={content}>{children}</TabHoverPopover>;
}

function useTypingPlaceholder(inputRef: React.RefObject<HTMLInputElement | null>, examples: readonly string[], active: boolean): void {
	const state = useRef({ index: 0, char: examples[0].length, phase: 'paused' as 'typing' | 'paused' | 'deleting' });
	const pausedRef = useRef(false);

	useEffect(() => {
		const setPlaceholder = (value: string) => {
			const el = inputRef.current;
			if (el) el.placeholder = value;
		};

		const first = examples[0];
		state.current = { index: 0, char: first.length, phase: 'paused' };
		setPlaceholder(first);
		if (!active) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			const interval = setInterval(() => {
				state.current.index = (state.current.index + 1) % examples.length;
				setPlaceholder(examples[state.current.index]);
			}, PAUSE_DURATION);
			return () => clearInterval(interval);
		}

		// One fixed-rate interval owns the whole animation; per-step pacing comes from
		// nextStepAt so the timer handle never changes and cleanup is a single clearInterval.
		let nextStepAt = Date.now() + 500;
		// Each step re-renders the demo, so the typing holds while the hero is scrolled away or the tab is hidden.
		let isOnScreen = true;
		const visibility = new IntersectionObserver(([entry]) => {
			isOnScreen = entry.isIntersecting;
		});
		if (inputRef.current) visibility.observe(inputRef.current);
		const step = () => {
			if (pausedRef.current || !isOnScreen || document.hidden || Date.now() < nextStepAt) return;

			const s = state.current;
			const example = examples[s.index];
			switch (s.phase) {
				case 'typing':
					s.char++;
					setPlaceholder(example.slice(0, s.char));
					if (s.char >= example.length) {
						s.phase = 'paused';
						nextStepAt = Date.now() + PAUSE_DURATION;
					} else {
						nextStepAt = Date.now() + TYPE_SPEED;
					}
					break;
				case 'paused':
					s.phase = 'deleting';
					nextStepAt = Date.now() + DELETE_SPEED;
					break;
				case 'deleting':
					s.char--;
					setPlaceholder(example.slice(0, s.char));
					if (s.char <= 0) {
						s.phase = 'typing';
						s.index = (s.index + 1) % examples.length;
						nextStepAt = Date.now() + TYPE_SPEED + 100;
					} else {
						nextStepAt = Date.now() + DELETE_SPEED;
					}
					break;
			}
		};
		const interval = setInterval(step, DELETE_SPEED);
		return () => {
			clearInterval(interval);
			visibility.disconnect();
		};
	}, [inputRef, examples, active]);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;

		const pause = () => {
			pausedRef.current = true;
		};
		const resume = () => {
			pausedRef.current = false;
		};

		input.addEventListener('focus', pause);
		input.addEventListener('blur', resume);
		return () => {
			input.removeEventListener('focus', pause);
			input.removeEventListener('blur', resume);
		};
	}, [inputRef]);
}

const SCROLLABLE_TAB_ROW = 'overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:none] [-webkit-overflow-scrolling:touch]';

export type DemoInputProps = {
	/** Where a run goes, with the job and what was typed as search params. */
	action?: string;
};

export function DemoInput({ action = '/signup' }: DemoInputProps) {
	const [jobId, setJobId] = useState<HeroJobId>(DEFAULT_HERO_JOB);

	const [value, setValue] = useState('');
	const [isNavigating, setIsNavigating] = useState(false);
	const [showValidationError, setShowValidationError] = useState(false);
	const isMobile = useIsMobile();
	const prefersReducedMotion = useReducedMotion();
	const isSubmitting = useRef(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const jobTabsRef = useRef<HTMLDivElement>(null);
	const activePillRef = useRef<HTMLSpanElement>(null);
	const isPillReady = useTabGlide(activePillRef, jobId, prefersReducedMotion ?? false);

	const job = getHeroJob(jobId);
	const examples = job.examples;
	const isUrlJob = job.inputKind === 'url';
	const placeholderExamples = useMemo(() => (isUrlJob ? examples.map(stripProtocol) : examples), [examples, isUrlJob]);
	useTypingPlaceholder(inputRef, placeholderExamples, !value);

	useEffect(() => {
		const tabs = jobTabsRef.current;
		const activeTab = tabs?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
		if (!tabs || !activeTab || tabs.scrollWidth <= tabs.clientWidth) return;

		const tabLeft = activeTab.offsetLeft;
		const tabRight = tabLeft + activeTab.offsetWidth;
		const visibleRight = tabs.scrollLeft + tabs.clientWidth;
		const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

		if (tabLeft < tabs.scrollLeft) {
			tabs.scrollTo({ left: Math.max(0, tabLeft - 4), behavior: scrollBehavior });
		} else if (tabRight > visibleRight) {
			tabs.scrollTo({ left: tabRight - tabs.clientWidth + 4, behavior: scrollBehavior });
		}
	}, [jobId, isMobile, prefersReducedMotion]);

	const normalizeForJob = (raw: string, id: HeroJobId) => (getHeroJob(id).inputKind === 'url' ? stripProtocol(raw) : raw);

	const handleJobChange = (id: HeroJobId) => {
		if (id === jobId) return;
		const next = getHeroJob(id);
		setJobId(id);
		setValue((current) => (next.inputKind === job.inputKind ? normalizeForJob(current, next.id) : ''));
		setShowValidationError(false);
		isSubmitting.current = false;
		setIsNavigating(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShowValidationError(false);
		setValue(normalizeForJob(e.target.value, job.id));
	};

	const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		setShowValidationError(false);
		setValue(normalizeForJob(e.clipboardData.getData('text'), job.id));
	};


	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting.current) return;
		// An empty field runs the first example, which is what the placeholder is showing.
		const destination = buildHeroDestination(job, value.trim() || examples[0], action);
		if (!destination) {
			setShowValidationError(true);
			inputRef.current?.focus();
			return;
		}
		isSubmitting.current = true;
		setIsNavigating(true);
		window.location.assign(destination.href);
	};

	return (
		<div className="w-full max-w-3xl rounded-window bg-blue-80 p-2">
			<form
				// WebMCP (W3C draft): toolname/tooldescription let browser-resident agents
				// discover this form as a callable tool from the server-rendered HTML.
				{...{ toolname: 'context-dev-hero-demo', tooldescription: 'Explore Context.dev APIs: scrape a URL, crawl a site, map its URLs, search the web, ask a research question, or retrieve brand data. Pick the job and enter a URL or a query. Running an example requires a free account.' }}
				onSubmit={handleSubmit}
				data-hero-job={jobId}
				className="relative flex w-full flex-col overflow-hidden rounded-window bg-surface"
			>
				<div className="flex shrink-0 px-2.5 pt-2.5 md:px-3 md:pt-3">
					{/* The inset padding gives the active tab's shadow room inside the scroll row, which would otherwise clip it. */}
					<div ref={jobTabsRef} role="group" aria-label="What to run" className={cn('relative flex min-w-0 items-center rounded-window bg-surface-subtle p-1', SCROLLABLE_TAB_ROW)}>
						<GlideHover className="flex items-center gap-0.5" highlightClassName="rounded-card bg-white/60">
							{/* One chip glides between tabs (see useTabGlide); until it's placed, the active tab draws its own. */}
							<span ref={activePillRef} aria-hidden="true" className={cn('pointer-events-none absolute left-0 top-0 -z-10 rounded-card bg-surface ring-1 ring-line', !isPillReady && 'invisible')} />
							{HERO_JOBS.map((tab) => {
								const isActive = tab.id === jobId;
								const expandedSuffix = tab.expandedLabel.slice(tab.label.length);
								return (
									<DesktopTabHoverPopover key={tab.id} content={tab.tooltip} isMobile={isMobile}>
										<button
											type="button"
											aria-label={isActive ? tab.expandedLabel : tab.label}
											aria-pressed={isActive}
											data-glide-item=""
											data-tab-id={tab.id}
											onClick={() => handleJobChange(tab.id)}
											className={cn('relative flex h-10 shrink-0 cursor-pointer select-none items-center gap-2 rounded-card pl-2.5 pr-3', FOCUS_VISIBLE_CLASS, isActive && !isPillReady && 'bg-surface')}
										>
											<JobGlyph id={tab.id} isActive={isActive} />
											<span aria-hidden="true" className={cn('flex whitespace-nowrap text-body-sm transition-colors duration-150 ease-out motion-reduce:transition-none', isActive ? 'text-fg' : 'text-fg-muted')}>
												{tab.label}
												{expandedSuffix && (
													// Width and opacity are driven by useTabGlide while switching; these are the resting states.
													<span data-tab-suffix={tab.id} className={cn('block overflow-hidden', isActive ? 'opacity-100' : 'w-0 opacity-0')}>
														<span className="block w-max whitespace-pre">{expandedSuffix}</span>
													</span>
												)}
											</span>
										</button>
									</DesktopTabHoverPopover>
								);
							})}
						</GlideHover>
					</div>
				</div>

				{/* Label wrapper: its ::before stretches over the whole field row (the nearest positioned ancestor), so clicks
				    anywhere in the row focus the input via native label semantics. The input and button are positioned, so they sit above. */}
				<div className="relative flex h-16 shrink-0 items-center gap-3 pr-2.5 md:pr-3">
					<label className="flex min-w-0 flex-1 cursor-text items-center gap-3 px-5 before:absolute before:inset-0 before:cursor-text before:content-[''] md:px-6">
						{/* ds-override: decorative icon, a UI part at 3.95:1 (3:1 required), not text */}
						<Globe className="relative size-5 shrink-0 text-fg-subtle" />
						<input
							ref={inputRef}
							id="quick-demo-domain"
							name={isUrlJob ? 'domain' : 'query'}
							type="text"
							data-ph-capture="true"
							value={value}
							onChange={handleInputChange}
							onPaste={handleInputPaste}
							placeholder={placeholderExamples[0]}
							aria-label={INPUT_LABELS[job.inputKind]}
							enterKeyHint="go"
							autoComplete="off"
							disabled={isNavigating}
							className="relative min-w-0 flex-1 bg-transparent py-0 font-data text-body-lg text-fg placeholder:text-fg-subtle focus-visible:outline-none disabled:opacity-60"
						/>
					</label>
										<button
						type="submit"
						disabled={isNavigating}
						aria-busy={isNavigating}
						aria-label={job.actionLabel}
						className="relative isolate flex h-12 w-14 shrink-0 cursor-pointer items-center justify-center rounded-window bg-brand text-on-brand transition-colors duration-150 ease-out hover:bg-navy-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none md:w-16"
					>
						{isNavigating ? <Spinner className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
					</button>
				</div>

				{showValidationError && (
					<p role="alert" className="px-5 pb-3 text-body-sm text-danger">
						{inputError(job.inputKind, examples[0])}
					</p>
				)}
			</form>
		</div>
	);
}
