/* The brand's dot patterns for any stack, written by `apply`. No framework, no dependencies: mark an element and the
   script draws the circle grid behind its content, cleared around every line of text and every image, button or card
   in it, the way the brand's site does.

     data-ds-dots            hero field: faint brand rings with four solid diamonds, lit under the pointer
     data-ds-dots="panel"    blue panel with white rings around the one visual it holds (the hero's screenshot or demo)
     data-ds-dots="frame"    white frame with faint rings around an image, screenshot or illustration
     data-ds-hole            on any descendant: the dots clear around its box as well

   Styles for the containers are in dots.css. Dots are drawn once per layout (resize, fonts, images) and rest still;
   the only motion is a fade in and, with a mouse, the rings filling near the pointer. */
(() => {
	if (typeof window === 'undefined' || window.__dsDots) return;
	window.__dsDots = true;
	const SVG = 'http://www.w3.org/2000/svg';
	const TONES = {
		field: { color: 'var(--ds-color-brand)', hollow: 0.25, solid: 0.4, clusters: true, spotlight: 0.5, clear: 1.25 },
		panel: { color: 'var(--ds-color-white)', hollow: 0.5, solid: 1, clusters: false, spotlight: 0, clear: 0.75 },
		frame: { color: 'var(--ds-color-brand)', hollow: 0.2, solid: 0.3, clusters: false, spotlight: 0, clear: 0.75 },
	};
	const DOT_RADIUS_RATIO = 0.31;
	const CLUSTERS = [
		{ x: 0.12, y: 0.2 },
		{ x: 0.86, y: 0.3 },
		{ x: 0.1, y: 0.78 },
		{ x: 0.9, y: 0.84 },
	];
	// Elements whose whole box is content: the dots clear around the box, not just its text.
	const BOXES = 'img,picture,video,canvas,iframe,svg,button,a,input,select,textarea,table,pre,[data-ds-hole]';
	const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	// Rows and columns stretch by a fraction of a pixel so the outer dots sit half a pitch inside every edge.
	function fitAxis(extent, pitch) {
		const count = Math.max(1, Math.round(extent / pitch));
		const step = count > 1 ? (extent - pitch) / (count - 1) : 0;
		return { count, at: (i) => pitch / 2 + i * step };
	}

	// Hidden or faded-out elements (a decorative window shown only on wide screens) leave the dots alone.
	// Decorative layers (aria-hidden) may overlap the dots: only content people read or use clears them.
	function shown(el) {
		if (!el || el.closest('[aria-hidden="true"]')) return false;
		if (el.checkVisibility) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
		const style = getComputedStyle(el);
		return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
	}

	function visibleBox(r) {
		return r.width > 0 && r.height > 0;
	}

	// Text clears line by line, so the cut-out follows a headline's ragged edge; boxes and cards clear whole.
	function measureHoles(el, layer, framed) {
		const origin = el.getBoundingClientRect();
		const holes = [];
		const push = (r, snug) => visibleBox(r) && holes.push({ l: r.left - origin.left, t: r.top - origin.top, r: r.right - origin.left, b: r.bottom - origin.top, snug });
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const range = document.createRange();
		for (let node = walker.nextNode(), n = 0; node && n < 2000; node = walker.nextNode(), n++) {
			if (!node.textContent.trim() || layer.contains(node) || !shown(node.parentElement)) continue;
			range.selectNodeContents(node);
			for (const r of range.getClientRects()) push(r, false);
		}
		for (const child of el.querySelectorAll('*')) {
			if (layer.contains(child) || !shown(child)) continue;
			// In a panel or frame only the visual it holds clears the rings, not what floats over it.
			if (framed && !child.hasAttribute('data-ds-dots-fill') && /^(absolute|fixed)$/.test(getComputedStyle(child).position)) continue;
			// Anything filling most of the section is its background (a canvas effect, a wrapper), not content.
			const box = child.getBoundingClientRect();
			if (box.width * box.height > 0.6 * origin.width * origin.height) continue;
			if (child.matches(BOXES)) {
				if (!child.parentElement?.closest(BOXES)) push(box, true);
				continue;
			}
			// A card or panel (its own background, border or shadow) is content too.
			const style = getComputedStyle(child);
			const filled = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
			if (filled || style.borderTopWidth !== '0px' || style.boxShadow !== 'none' || style.backgroundImage !== 'none') push(box, true);
		}
		return holes;
	}

	function diamond(size) {
		const cells = [];
		for (let dy = -size; dy <= size; dy++) for (let dx = -size; dx <= size; dx++) if (Math.abs(dx) + Math.abs(dy) <= size) cells.push([dx, dy]);
		return cells;
	}

	function layout(width, height, holes, tone) {
		const mobile = window.innerWidth < 640;
		const pitch = mobile ? 12 : 16;
		const cols = fitAxis(width, pitch);
		const rows = fitAxis(height, pitch);
		const visible = new Uint8Array(cols.count * rows.count);
		for (let row = 0; row < rows.count; row++) {
			for (let col = 0; col < cols.count; col++) {
				const x = cols.at(col);
				const y = rows.at(row);
				visible[row * cols.count + col] = holes.some((h) => {
					const c = pitch * (h.snug ? 0.75 : tone.clear);
					return x > h.l - c && x < h.r + c && y > h.t - c && y < h.b + c;
				})
					? 0
					: 1;
			}
		}
		const free = (col, row) => col >= 0 && row >= 0 && col < cols.count && row < rows.count && visible[row * cols.count + col] === 1;
		const solid = new Set();
		if (tone.clusters) {
			const shape = diamond(mobile ? 2 : 3);
			for (const target of CLUSTERS) {
				const tx = target.x * (cols.count - 1);
				const ty = target.y * (rows.count - 1);
				let best = null;
				for (let row = 0; row < rows.count; row++) {
					for (let col = 0; col < cols.count; col++) {
						const d = (col - tx) ** 2 + (row - ty) ** 2;
						if (best && d >= best.d) continue;
						if (shape.every(([dx, dy]) => free(col + dx, row + dy) && !solid.has(`${col + dx}:${row + dy}`))) best = { col, row, d };
					}
				}
				if (best) for (const [dx, dy] of shape) solid.add(`${best.col + dx}:${best.row + dy}`);
			}
		}
		const hollow = [];
		const filled = [];
		for (let row = 0; row < rows.count; row++) {
			for (let col = 0; col < cols.count; col++) {
				if (!free(col, row)) continue;
				(solid.has(`${col}:${row}`) ? filled : hollow).push([cols.at(col), rows.at(row)]);
			}
		}
		return { radius: pitch * DOT_RADIUS_RATIO, hollow, filled };
	}

	// Many dots as one path (two arcs each), so a field of a thousand dots is three DOM nodes.
	function dotsPath(dots, radius) {
		const r = +radius.toFixed(2);
		const d = +(radius * 2).toFixed(2);
		let path = '';
		for (const [x, y] of dots) path += `M${+(x - radius).toFixed(2)} ${+y.toFixed(2)}a${r} ${r} 0 1 0 ${d} 0a${r} ${r} 0 1 0 ${-d} 0`;
		return path;
	}

	function node(name, attrs) {
		const n = document.createElementNS(SVG, name);
		for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
		return n;
	}

	let uid = 0;
	function mount(el) {
		const tone = TONES[el.getAttribute('data-ds-dots')] ?? TONES.field;
		const layer = node('svg', { 'aria-hidden': 'true', 'data-ds-dots-layer': '', focusable: 'false' });
		el.prepend(layer);
		const id = `ds-dots-${++uid}`;
		let spot = null;
		let lit = null;
		let frame = 0;
		const draw = () => {
			frame = 0;
			if (!tone.clusters) for (const child of el.children) if (child.matches('img,video,picture,iframe,canvas') && /^(absolute|fixed)$/.test(getComputedStyle(child).position)) child.setAttribute('data-ds-dots-fill', '');
			const { radius, hollow, filled } = layout(el.clientWidth, el.clientHeight, measureHoles(el, layer, !tone.clusters), tone);
			layer.replaceChildren();
			layer.append(node('path', { fill: 'none', stroke: tone.color, 'stroke-width': 1, opacity: tone.hollow, d: dotsPath(hollow, radius - 0.5) }));
			if (filled.length) layer.append(node('path', { fill: tone.color, opacity: tone.solid, d: dotsPath(filled, radius) }));
			if (tone.spotlight) {
				const defs = node('defs', {});
				const falloff = node('radialGradient', { id: `${id}-falloff` });
				falloff.append(node('stop', { offset: '0%', 'stop-color': 'white' }), node('stop', { offset: '100%', 'stop-color': 'black' }));
				const mask = node('mask', { id: `${id}-mask` });
				spot = node('circle', { cx: -9999, cy: -9999, r: (radius / DOT_RADIUS_RATIO) * 6, fill: `url(#${id}-falloff)` });
				mask.append(spot);
				defs.append(falloff, mask);
				lit = node('path', { mask: `url(#${id}-mask)`, fill: tone.color, 'data-ds-dots-lit': '', d: dotsPath([...hollow, ...filled], radius - 0.5) });
				lit.style.setProperty('--ds-dots-lit', tone.spotlight);
				layer.append(defs, lit);
			}
			layer.setAttribute('data-ready', '');
		};
		const relayout = () => {
			if (!frame) frame = requestAnimationFrame(draw);
		};
		new ResizeObserver(relayout).observe(el);
		document.fonts?.ready.then(relayout);
		for (const img of el.querySelectorAll('img')) if (!img.complete) img.addEventListener('load', relayout, { once: true });
		// The rings near a mouse pointer fill in: a decorative trace on marketing pages only, never on touch or with
		// reduced motion. Only the mask's circle moves, two attribute writes a frame.
		if (tone.spotlight && finePointer() && !reduced()) {
			let point = null;
			let raf = 0;
			el.addEventListener(
				'pointermove',
				(e) => {
					if (e.pointerType !== 'mouse' || !spot) return;
					const o = el.getBoundingClientRect();
					point = [e.clientX - o.left, e.clientY - o.top];
					lit?.setAttribute('data-on', '');
					if (!raf)
						raf = requestAnimationFrame(() => {
							raf = 0;
							spot.setAttribute('cx', point[0]);
							spot.setAttribute('cy', point[1]);
						});
				},
				{ passive: true },
			);
			el.addEventListener('pointerleave', () => lit?.removeAttribute('data-on'));
		}
	}

	const seen = new WeakSet();
	const scan = () => {
		for (const el of document.querySelectorAll('[data-ds-dots]')) {
			if (seen.has(el)) continue;
			seen.add(el);
			mount(el);
		}
	};
	// Pages that change without a reload (client routing) get their new sections drawn too.
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
