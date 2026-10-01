import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, isInDotBox, paintShape, rings, roundedBox, solid, solidWithSpeckle, type DotBox, type DotPainter, type DotShape } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The theming page's pictures, in the brand dot grid: one dashboard, drawn three times over for three tenants. The
 * layout never changes; what changes is the brand on it, the mark in the sidebar, the tone of the sidebar and the
 * accents, the shape of the button and the numbers in the chart.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const TENANT_THEME_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = TENANT_THEME_GRID;
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const APP: DotBox = { left: 3, right: 54, top: 2, bottom: 30 };
const SIDEBAR = { right: 15, mark: { column: 9.5, row: 7, size: 2.6 }, links: { rows: [13, 16, 19, 22], left: 6, right: 12 } };
const MAIN = { left: 18, right: 52, title: { rows: [5, 6], right: 30 }, button: { left: 43, right: 52, top: 4, bottom: 7 } };
const STATS = { top: 10, bottom: 15, lefts: [18, 30, 42], columns: 11 };
const CHART = { bottom: 28, from: 19, every: 4, width: 2, tallest: 9 };

interface Tenant {
	domain: string;
	sidebar: DotPainter;
	accent: DotPainter;
	/** The tenant's mark, a shape centred on the origin and about one unit across. */
	mark: (across: number, down: number) => boolean;
	buttonRadius: number;
	bars: number[];
}

const TENANTS: Tenant[] = [
	{ domain: 'super.com', sidebar: solid, accent: solidWithSpeckle, mark: (across, down) => Math.hypot(across, down) <= 1, buttonRadius: 2, bars: [3, 5, 4, 7, 6, 8, 5, 9, 7] },
	{ domain: 'daily.dev', sidebar: rings, accent: solid, mark: (across, down) => Math.max(Math.abs(across), Math.abs(down)) <= 0.85, buttonRadius: 0, bars: [8, 6, 7, 4, 5, 3, 6, 4, 5] },
	{ domain: 'mintlify.com', sidebar: solidWithSpeckle, accent: rings, mark: (across, down) => down <= 0.9 && down >= -0.9 && Math.abs(across) <= (down + 0.9) / 1.8 + 0.2, buttonRadius: 1, bars: [4, 4, 6, 6, 8, 5, 9, 9, 6] },
];

function paintDashboard(states: Uint8Array, { sidebar, accent, mark, buttonRadius, bars }: Tenant) {
	const button: DotShape = roundedBox(MAIN.button, buttonRadius);
	return paintShape(TENANT_THEME_GRID, states, roundedBox(APP, 2), (column, row) => {
		if (column <= SIDEBAR.right) {
			if (mark((column - SIDEBAR.mark.column) / SIDEBAR.mark.size, (row - SIDEBAR.mark.row) / SIDEBAR.mark.size)) return sidebar === rings ? DOT_FILLED : DOT_ABSENT;
			if (SIDEBAR.links.rows.includes(row) && between(column, SIDEBAR.links.left, SIDEBAR.links.right)) return sidebar === rings ? DOT_FILLED : DOT_ABSENT;
			return sidebar(column, row);
		}
		if (column === SIDEBAR.right + 1) return DOT_ABSENT;
		if (button(column, row)) return DOT_FILLED;
		if (MAIN.title.rows.includes(row)) return between(column, MAIN.left, MAIN.title.right) ? DOT_FILLED : DOT_ABSENT;
		const stat = STATS.lefts.find((left) => isInDotBox({ left, right: left + STATS.columns - 1, top: STATS.top, bottom: STATS.bottom }, column, row));
		if (stat !== undefined) {
			const isEdge = column === stat || column === stat + STATS.columns - 1 || row === STATS.top || row === STATS.bottom;
			if (isEdge) return DOT_HOLLOW;
			return row === STATS.top + 2 && between(column, stat + 2, stat + 6) ? accent(column, row) : DOT_ABSENT;
		}
		const bar = (column - CHART.from) / CHART.every;
		const barIndex = Math.floor(bar);
		if (between(barIndex, 0, bars.length - 1) && column - CHART.from - barIndex * CHART.every < CHART.width && between(row, CHART.bottom - bars[barIndex] + 1, CHART.bottom)) return accent(column, row);
		return DOT_ABSENT;
	});
}

const dashboardOf = (tenant: Tenant): StoryPicture => {
	const states = paintDashboard(new Uint8Array(COLUMNS * ROWS), tenant);
	return { states, cells: cellsOfStates(TENANT_THEME_GRID, states) };
};

const DOMAIN_SIZE = 18;
// Doto is monospaced, each letter three fifths of its size wide; typed text is set from its left so the cursor can follow it.
const domainText = (domain: string): DotStoryText => ({ text: domain, x: (COLUMNS * PITCH) / 2 - (domain.length * 0.6 * DOMAIN_SIZE) / 2, y: (34 + 0.5) * PITCH + DOMAIN_SIZE / 3, size: DOMAIN_SIZE, weight: 800 });

export const TENANT_THEMES = TENANTS.map((tenant) => ({ picture: dashboardOf(tenant), domain: domainText(tenant.domain) }));
/** Where each new theme spreads from: the tenant's mark in the sidebar. */
export const THEME_ORIGIN = { column: SIDEBAR.mark.column, row: SIDEBAR.mark.row };

/** The first tenant's dashboard: what the picture shows before it plays, and instead of playing with reduced motion. */
export const TENANT_THEME_RESTING = { ...TENANT_THEMES[0].picture, texts: [TENANT_THEMES[0].domain] };
