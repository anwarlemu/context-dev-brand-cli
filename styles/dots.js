/* The brand's hero dot field for any stack, written by `apply`: a port of the site's stream field (hero-dot-field
   with streams, on the white surface). Curved streams of small dots run in from the hero's edges toward its content,
   wide where they enter and fraying to a thread, so the middle stays bare. Mark the hero section with data-ds-dots;
   the dots also clear around any text, button or image they reach. No framework, no dependencies.

   The field fades in once and then rests still. */
(() => {
	if (typeof window === 'undefined' || window.__dsDots) return;
	window.__dsDots = true;
	const SVG = 'http://www.w3.org/2000/svg';
	// The site's fine field: the narrow-screen pitch at every width.
	const PITCH = 12;
	const DOT_RADIUS_RATIO = 0.32;
	const CLEARANCE_RATIO = 1;
	const ENTRY_HALF_WIDTH = 5.5;
	const TAIL_HALF_WIDTH = 0.5;
	const SAMPLES = 120;
	const RING_SHARE = 0.3;
	const LIT_SHARE = 0.12;
	const TAIL_OPACITY = 0.5;
	const DIM_OPACITY = 0.14;
	const RING_OPACITY = 0.55;
	const SEED = 7;
	// Each stream points at the headline, so the web reads as flowing into the content; the two sides differ on purpose.
	const CURVES = [
		[[-0.04, 0.04], [0.12, 0.08], [0.23, 0.36]],
		[[-0.04, 0.42], [0.08, 0.54], [0.22, 0.62]],
		[[0.04, 1.05], [0.08, 0.82], [0.22, 0.78]],
		[[0.9, -0.05], [0.9, 0.16], [0.78, 0.3]],
		[[1.04, 0.3], [0.9, 0.3], [0.77, 0.46]],
		[[1.04, 0.62], [0.92, 0.7], [0.78, 0.7]],
		[[0.97, 1.05], [0.94, 0.9], [0.8, 0.82]],
	];
	// On a phone the side streams are slivers, so two more sweep in across the foot.
	const PHONE_CURVES = [
		[[-0.06, 0.74], [0.28, 0.84], [0.46, 1.05]],
		[[1.06, 0.82], [0.72, 0.88], [0.58, 1.05]],
	];
	const BOXES = 'img,picture,video,canvas,iframe,svg,button,a,input,select,textarea,table,pre,[data-ds-hole]';

	function hash(x, y) {
		let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(SEED, 2147483647);
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
	}

	function pointOn([a, b, c], t, w, h) {
		const u = 1 - t;
		return [(u * u * a[0] + 2 * u * t * b[0] + t * t * c[0]) * w, (u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]) * h];
	}

	// Decorative layers (aria-hidden) and hidden elements leave the dots alone; only content people read or use clears them.
	function shown(el) {
		if (!el || el.closest('[aria-hidden="true"]')) return false;
		if (el.checkVisibility) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
		const s = getComputedStyle(el);
		return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
	}

	// Text clears line by line, so the cut follows a headline's ragged edge; buttons, images and cards clear whole.
	function measureHoles(el, layer) {
		const o = el.getBoundingClientRect();
		const holes = [];
		const push = (r) => r.width > 0 && r.height > 0 && holes.push([r.left - o.left, r.top - o.top, r.right - o.left, r.bottom - o.top]);
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const range = document.createRange();
		for (let n = walker.nextNode(), i = 0; n && i < 2000; n = walker.nextNode(), i++) {
			if (!n.textContent.trim() || layer.contains(n) || !shown(n.parentElement)) continue;
			range.selectNodeContents(n);
			for (const r of range.getClientRects()) push(r);
		}
		for (const child of el.querySelectorAll('*')) {
			if (layer.contains(child) || !shown(child)) continue;
			const box = child.getBoundingClientRect();
			// Anything filling most of the hero is its background (a canvas effect, a wrapper), not content.
			if (box.width * box.height > 0.6 * o.width * o.height) continue;
			if (child.matches(BOXES)) {
				if (!child.parentElement?.closest(BOXES)) push(box);
				continue;
			}
			const s = getComputedStyle(child);
			const filled = s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent';
			if (filled || s.borderTopWidth !== '0px' || s.boxShadow !== 'none') push(box);
		}
		return holes;
	}

	function layout(width, height, holes) {
		const cols = Math.floor(width / PITCH);
		const rows = Math.floor(height / PITCH);
		const clear = PITCH * CLEARANCE_RATIO;
		const curves = width < 640 ? [...CURVES, ...PHONE_CURVES] : CURVES;
		// Each stream claims the cells within its width as it runs; a cell two streams cross keeps the first.
		const cells = new Map();
		curves.forEach((curve, stream) => {
			for (let s = 0; s <= SAMPLES; s++) {
				const t = s / SAMPLES;
				const [x, y] = pointOn(curve, t, width, height);
				const half = (ENTRY_HALF_WIDTH + (TAIL_HALF_WIDTH - ENTRY_HALF_WIDTH) * t) * PITCH;
				const reach = Math.ceil(half / PITCH);
				const cc = Math.floor(x / PITCH);
				const cr = Math.floor(y / PITCH);
				for (let r = cr - reach; r <= cr + reach; r++) {
					for (let c = cc - reach; c <= cc + reach; c++) {
						if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
						const d = Math.hypot(c * PITCH + PITCH / 2 - x, r * PITCH + PITCH / 2 - y);
						if (d > half) continue;
						const key = `${c}:${r}`;
						const had = cells.get(key);
						if (had && (had.stream !== stream || had.d <= d)) continue;
						cells.set(key, { stream, t, d });
					}
				}
			}
		});
		const dots = [];
		for (const [key, { t }] of cells) {
			const [c, r] = key.split(':').map(Number);
			const x = c * PITCH + PITCH / 2;
			const y = r * PITCH + PITCH / 2;
			if (holes.some(([l, tp, rt, b]) => x > l - clear && x < rt + clear && y > tp - clear && y < b + clear)) continue;
			// The stream breaks up toward its tail, fraying into the open middle.
			if (hash(c + 71, r + 37) < t ** 2 * 0.7) continue;
			const roll = hash(c + 101, r + 211);
			dots.push({ x, y, kind: roll < RING_SHARE ? 'ring' : roll > 1 - LIT_SHARE ? 'lit' : 'dim', opacity: 1 - (1 - TAIL_OPACITY) * t });
		}
		return dots;
	}

	function node(name, attrs) {
		const n = document.createElementNS(SVG, name);
		for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
		return n;
	}

	function mount(el) {
		const layer = node('svg', { 'aria-hidden': 'true', 'data-ds-dots-layer': '', focusable: 'false' });
		el.prepend(layer);
		const radius = PITCH * DOT_RADIUS_RATIO - 0.5;
		let frame = 0;
		const draw = () => {
			frame = 0;
			const g = node('g', { fill: 'currentColor', stroke: 'currentColor', 'stroke-width': 1 });
			for (const d of layout(el.clientWidth, el.clientHeight, measureHoles(el, layer))) {
				g.append(node('circle', { cx: d.x, cy: d.y, r: radius, opacity: +d.opacity.toFixed(2), 'fill-opacity': d.kind === 'ring' ? 0 : d.kind === 'lit' ? 1 : DIM_OPACITY, 'stroke-opacity': d.kind === 'ring' ? RING_OPACITY : 0 }));
			}
			layer.replaceChildren(g);
			layer.setAttribute('data-ready', '');
		};
		const relayout = () => {
			if (!frame) frame = requestAnimationFrame(draw);
		};
		new ResizeObserver(relayout).observe(el);
		document.fonts?.ready.then(relayout);
		for (const img of el.querySelectorAll('img')) if (!img.complete) img.addEventListener('load', relayout, { once: true });
	}

	const seen = new WeakSet();
	const scan = () => {
		for (const el of document.querySelectorAll('[data-ds-dots]')) {
			if (seen.has(el)) continue;
			seen.add(el);
			mount(el);
		}
	};
	// Pages that change without a reload (client routing) get their new hero drawn too.
	let pending = 0;
	const start = () => {
		scan();
		new MutationObserver(() => {
			if (!pending) pending = requestAnimationFrame(() => ((pending = 0), scan()));
		}).observe(document.body, { childList: true, subtree: true });
	};
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
	else start();
})();
