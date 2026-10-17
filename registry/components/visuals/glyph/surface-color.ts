/**
 * The color a dot picture repaints around its dots. It defaults to the theme's surface token, which SVG can use as is;
 * a canvas can't read CSS variables, so `resolveColor` turns `var(--token)` into the color it currently stands for.
 */
export const SURFACE_COLOR = "var(--ds-color-bg-default)";

export function resolveColor(element: Element, color: string) {
  const token = /^var\((--[\w-]+)\)$/.exec(color)?.[1];
  return token ? getComputedStyle(element).getPropertyValue(token).trim() || color : color;
}
