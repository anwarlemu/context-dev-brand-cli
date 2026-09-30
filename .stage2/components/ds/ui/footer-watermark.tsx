'use client';

import { CursorClickIcon } from '@/components/ds/ui/CursorClickIcon';
import { sampleWatermarkDots, type DotLayer, type WatermarkDots, type WatermarkPart } from '@/components/ds/ui/footer-watermark-dots';
import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

type Point = { x: number; y: number };

const VIEW_BOX = { width: 140, height: 24 };
const BASELINE_Y = 22;
const OUTLINED_PART = 'context.';
const SOLID_PART = 'dev';
const PARTS: WatermarkPart[] = [
	{ firstCharacter: 0, characterCount: OUTLINED_PART.length, isMostlySolid: false },
	{ firstCharacter: OUTLINED_PART.length, characterCount: SOLID_PART.length, isMostlySolid: true },
];
// In viewBox units. On a narrow screen the dots stop shrinking with the wordmark, so they stay circles, not a grey wash.
const DOT_PITCH = 0.6;
const SMALLEST_DOT_PITCH_PX = 3;
const DOT_PITCH_STEPS_PER_UNIT = 20;
const SOLID_DOT_COLOR = '#FFFFFF';
const RING_COLOR = 'rgba(255, 255, 255, 0.55)';
const CURSOR_SIZE = 9;
const RESTING_CURSOR: Point = { x: 110, y: 5.5 };
// Where the pointer's tip lands inside the icon box, in viewBox units: CursorClickIcon's default -90° turn points it down and to the left.
const CURSOR_TIP: Point = { x: CURSOR_SIZE * (38 / 79), y: CURSOR_SIZE * (66 / 79) };
// In viewBox units: wide enough that the patch covers the letters from ascender to baseline, not just their tops.
const PATCH_RADIUS = 15;
// The patch swaps the paints fully out to this fraction of its radius, then feathers to nothing at the edge: a
// clean solid/outline swap inside, instead of letters caught half-way in a grey smear.
const PATCH_CORE = 0.6;
// Time constants (ms) for easing toward the target, so it feels the same at 60Hz and 120Hz: the patch keeps close
// to the pointer, grows in quickly, and fades a little faster than it grows when the pointer leaves.
const FOLLOW_MS = 55;
const GROW_MS = 90;
const SHRINK_MS = 70;
// The cursor waits on the "Onboard your agent" button as the footer scrolls in, then glides to its resting spot once
// the wordmark is mostly on screen, so the move is seen rather than finished before anyone gets there.
const CURSOR_LAUNCH_MS = 900;
const CURSOR_LAUNCH_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';
const CURSOR_LAUNCH_VISIBLE_RATIO = 0.6;
// Before the glide the cursor clicks the button: it presses toward its tip, holds, lets go, then sets off.
const CURSOR_PRESS_MS = 180;
const CURSOR_RELEASE_TO_LAUNCH_MS = 180;
const CURSOR_PRESSED_SCALE = 0.86;
const ease = (from: number, to: number, dt: number, tau: number) => to + (from - to) * Math.exp(-dt / tau);

function dotPitchAt(pixelsPerUnit: number) {
	const pitch = Math.max(DOT_PITCH, SMALLEST_DOT_PITCH_PX / pixelsPerUnit);
	return Math.round(pitch * DOT_PITCH_STEPS_PER_UNIT) / DOT_PITCH_STEPS_PER_UNIT;
}

function DotLayerPaths({ layer, ringStroke }: { layer: DotLayer; ringStroke: number }) {
	return (
		<>
			<path d={layer.rings} fill="none" stroke={RING_COLOR} strokeWidth={ringStroke} />
			<path d={layer.solids} fill={SOLID_DOT_COLOR} />
		</>
	);
}

function LaunchingCursor({ offset, isHidden, isPressing }: { offset: Point | null; isHidden: boolean; isPressing: boolean }) {
	return (
		<g
			style={{
				transform: `translate(${offset?.x ?? 0}px, ${offset?.y ?? 0}px)`,
				transition: offset ? 'none' : `transform ${CURSOR_LAUNCH_MS}ms ${CURSOR_LAUNCH_EASING}`,
				visibility: isHidden ? 'hidden' : 'visible',
			}}
		>
			<g
				style={{
					transform: `scale(${isPressing ? CURSOR_PRESSED_SCALE : 1})`,
					transformOrigin: `${RESTING_CURSOR.x + CURSOR_TIP.x}px ${RESTING_CURSOR.y + CURSOR_TIP.y}px`,
					transition: `transform ${CURSOR_PRESS_MS}ms ease-out`,
				}}
			>
				<CursorClickIcon x={RESTING_CURSOR.x} y={RESTING_CURSOR.y} width={CURSOR_SIZE} height={CURSOR_SIZE} />
			</g>
		</g>
	);
}

// A soft patch follows the pointer: inside it the rings of "context." fill in and the dots of "dev" hollow out.
export function FooterWatermark({ className }: { className?: string }) {
	const svgRef = useRef<SVGSVGElement>(null);
	const wordRef = useRef<SVGTextElement>(null);
	const [dots, setDots] = useState<WatermarkDots | null>(null);
	const inkRef = useRef<SVGGElement>(null);
	const [inkOffsetY, setInkOffsetY] = useState(0);
	const patchRefs = useRef<SVGCircleElement[]>([]);
	const target = useRef<Point & { radius: number }>({ x: 0, y: 0, radius: 0 });
	const current = useRef<Point & { radius: number }>({ x: 0, y: 0, radius: 0 });
	const frame = useRef(0);
	const lastFrame = useRef(0);
	const snap = useRef(false);
	const [cursorLaunchOffset, setCursorLaunchOffset] = useState<Point | null>(null);
	const [hasCursorLaunched, setHasCursorLaunched] = useState(false);
	const [isCursorPressing, setIsCursorPressing] = useState(false);

	useEffect(() => {
		snap.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		return () => cancelAnimationFrame(frame.current);
	}, []);

	useEffect(() => {
		const svg = svgRef.current;
		const word = wordRef.current;
		if (!svg || !word) return;

		let sampledPitch = 0;
		let isFontReady = false;
		const sample = () => {
			const pixelsPerUnit = svg.getScreenCTM()?.a;
			if (!isFontReady || !pixelsPerUnit) return;
			const pitch = dotPitchAt(pixelsPerUnit);
			if (pitch === sampledPitch) return;
			sampledPitch = pitch;
			setDots(sampleWatermarkDots(word, PARTS, pitch, VIEW_BOX));
		};

		const observer = new ResizeObserver(sample);
		observer.observe(svg);
		let isMounted = true;
		// The letters' shapes are read from the rendered font, so sampling waits for it.
		void document.fonts.ready.then(() => {
			if (!isMounted) return;
			isFontReady = true;
			sample();
		});
		return () => {
			isMounted = false;
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		const svg = svgRef.current;
		const origin = svg?.parentElement?.querySelector('[data-footer-cursor-origin]');
		if (!svg || !origin || !dots || hasCursorLaunched) return;
		const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const measureLaunchOffset = () => {
			const matrix = svg.getScreenCTM();
			if (!matrix) return null;
			const bounds = origin.getBoundingClientRect();
			const topBorderCenter = new DOMPoint(bounds.left + bounds.width / 2, bounds.top).matrixTransform(matrix.inverse());
			return { x: topBorderCenter.x - (RESTING_CURSOR.x + CURSOR_TIP.x), y: topBorderCenter.y - (RESTING_CURSOR.y + CURSOR_TIP.y) };
		};

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return;
				if (isReducedMotion) {
					observer.disconnect();
					setHasCursorLaunched(true);
					return;
				}
				setCursorLaunchOffset((offset) => offset ?? measureLaunchOffset());
				if (entry.intersectionRatio < CURSOR_LAUNCH_VISIBLE_RATIO) return;
				observer.disconnect();
				setIsCursorPressing(true);
				origin.setAttribute('data-pressed', '');
				clickTimers.push(
					setTimeout(() => {
						setIsCursorPressing(false);
						origin.removeAttribute('data-pressed');
					}, CURSOR_PRESS_MS),
					setTimeout(() => setHasCursorLaunched(true), CURSOR_PRESS_MS + CURSOR_RELEASE_TO_LAUNCH_MS)
				);
			},
			{ threshold: [0, CURSOR_LAUNCH_VISIBLE_RATIO] }
		);
		const clickTimers: ReturnType<typeof setTimeout>[] = [];
		observer.observe(svg);
		return () => {
			observer.disconnect();
			clickTimers.forEach(clearTimeout);
			origin.removeAttribute('data-pressed');
		};
	}, [dots, inkOffsetY, hasCursorLaunched]);

	// The font box leaves more room above the letters than below them, so the view is centred on the dots themselves.
	useEffect(() => {
		const ink = inkRef.current?.getBBox();
		if (!ink || ink.height === 0) return;
		setInkOffsetY(ink.y + ink.height / 2 - VIEW_BOX.height / 2);
	}, [dots]);

	const paint = () => {
		const { x, y, radius } = current.current;
		for (const patch of patchRefs.current) {
			patch.setAttribute('cx', String(x));
			patch.setAttribute('cy', String(y));
			patch.setAttribute('r', String(radius));
		}
	};

	const tick = (time: number) => {
		const now = current.current;
		const goal = target.current;
		// Capped, so a frame after the tab was hidden doesn't leap.
		const dt = lastFrame.current ? Math.min(64, time - lastFrame.current) : 16;
		lastFrame.current = time;
		if (snap.current) {
			Object.assign(now, goal);
		} else {
			now.x = ease(now.x, goal.x, dt, FOLLOW_MS);
			now.y = ease(now.y, goal.y, dt, FOLLOW_MS);
			now.radius = ease(now.radius, goal.radius, dt, goal.radius > now.radius ? GROW_MS : SHRINK_MS);
		}
		const settled = Math.abs(goal.x - now.x) < 0.01 && Math.abs(goal.y - now.y) < 0.01 && Math.abs(goal.radius - now.radius) < 0.01;
		if (settled) Object.assign(now, goal);
		paint();
		if (settled) {
			frame.current = 0;
			lastFrame.current = 0;
		} else {
			frame.current = requestAnimationFrame(tick);
		}
	};

	const animate = () => {
		if (!frame.current) frame.current = requestAnimationFrame(tick);
	};

	const toViewBox = (event: PointerEvent<SVGSVGElement>): Point | null => {
		const matrix = svgRef.current?.getScreenCTM();
		if (!matrix) return null;
		const { x, y } = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
		return { x, y };
	};

	const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
		const point = toViewBox(event);
		if (!point) return;
		// Entering from nothing starts the patch under the pointer rather than sliding in from its last spot.
		if (current.current.radius < 0.5) Object.assign(current.current, point);
		target.current = { ...point, radius: PATCH_RADIUS };
		animate();
	};

	const onPointerLeave = () => {
		target.current = { ...target.current, radius: 0 };
		animate();
	};

	const viewBox = `0 ${inkOffsetY} ${VIEW_BOX.width} ${VIEW_BOX.height}`;

	return (
		<>
			<svg
				ref={svgRef}
				viewBox={viewBox}
				preserveAspectRatio="xMidYMid meet"
				className={cn('pointer-events-auto absolute inset-0 h-full w-full tracking-tighter mix-blend-plus-lighter', className)}
				onPointerMove={onPointerMove}
				onPointerLeave={onPointerLeave}
				onPointerCancel={onPointerLeave}
				onPointerUp={(event) => {
					if (event.pointerType !== 'mouse') onPointerLeave();
				}}
			>
				<defs>
					<radialGradient id="footer-patch-in">
						<stop offset={PATCH_CORE} stopColor="white" stopOpacity={1} />
						<stop offset="1" stopColor="white" stopOpacity={0} />
					</radialGradient>
					<radialGradient id="footer-patch-out">
						<stop offset={PATCH_CORE} stopColor="black" stopOpacity={1} />
						<stop offset="1" stopColor="black" stopOpacity={0} />
					</radialGradient>
					<mask id="footer-patch-inside" maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="2000" height="2000">
						<circle
							ref={(element) => {
								if (element) patchRefs.current[0] = element;
							}}
							r="0"
							fill="url(#footer-patch-in)"
						/>
					</mask>
					<mask id="footer-patch-outside" maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="2000" height="2000">
						<rect x="-1000" y="-1000" width="2000" height="2000" fill="white" />
						<circle
							ref={(element) => {
								if (element) patchRefs.current[1] = element;
							}}
							r="0"
							fill="url(#footer-patch-out)"
						/>
					</mask>
				</defs>
				<text ref={wordRef} aria-hidden visibility="hidden" x={VIEW_BOX.width / 2} y={BASELINE_Y} textAnchor="middle" fontSize={VIEW_BOX.height} style={{ fontFamily: 'var(--font-rethink-sans), system-ui, sans-serif', fontWeight: '500' }}>
					{OUTLINED_PART}
					{SOLID_PART}
				</text>
				{dots && (
					<g ref={inkRef}>
						<g aria-hidden mask="url(#footer-patch-outside)">
							<DotLayerPaths layer={dots.resting} ringStroke={dots.ringStroke} />
						</g>
						<g aria-hidden mask="url(#footer-patch-inside)">
							<DotLayerPaths layer={dots.swapped} ringStroke={dots.ringStroke} />
						</g>
					</g>
				)}
			</svg>
			{/* Its own layer, above the "Onboard your agent" button, so the cursor rests on the button rather than sliding under it. */}
			<svg aria-hidden viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 z-20 h-full w-full">
				<LaunchingCursor offset={hasCursorLaunched ? null : cursorLaunchOffset} isHidden={!hasCursorLaunched && !cursorLaunchOffset} isPressing={isCursorPressing} />
			</svg>
		</>
	);
}
