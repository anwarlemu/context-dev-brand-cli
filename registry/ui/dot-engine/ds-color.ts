const cache = new WeakMap<Element, Map<string, string>>();

// Canvas paint cannot read CSS custom properties, so token colors given as var(--ds-...) are resolved against the element.
export function resolveColor(element: Element, value: string): string {
	const match = value.match(/^var\((--[a-z0-9-]+)\)$/);
	if (!match) return value;
	let byName = cache.get(element);
	if (!byName) cache.set(element, (byName = new Map()));
	const hit = byName.get(match[1]);
	if (hit) return hit;
	const resolved = getComputedStyle(element).getPropertyValue(match[1]).trim();
	byName.set(match[1], resolved);
	return resolved;
}

export const paintColor = (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, value: string) =>
	'canvas' in context && context.canvas instanceof HTMLCanvasElement && context.canvas.isConnected ? resolveColor(context.canvas, value) : resolveColor(document.documentElement, value);
