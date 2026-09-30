/**
 * Many same-sized dots as one SVG path, each a closed pair of arcs. A picture of a thousand dots is then a handful of
 * DOM nodes rather than a thousand `<circle>`s for the browser to style, lay out and React to hydrate.
 */
export function dotsPath(centres: Iterable<{ cx: number; cy: number }>, radius: number) {
	const diameter = +(radius * 2).toFixed(2);
	const r = +radius.toFixed(2);
	let path = '';
	for (const { cx, cy } of centres) path += `M${+(cx - radius).toFixed(2)} ${+cy.toFixed(2)}a${r} ${r} 0 1 0 ${diameter} 0a${r} ${r} 0 1 0 ${-diameter} 0`;
	return path;
}
