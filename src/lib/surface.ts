import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { Surface } from './recipes.js';

// What kind of interface a project is, read from its files before anything is restyled: a product (a dashboard, an
// admin, an app people work in) gets the product theme and the app-* recipes, a marketing site gets the site's page
// frame and the marketing recipes. The evidence is kept so the agent (and the person) can see why.

export type InterfaceProfile = { surface: Surface; product: number; marketing: number; reasons: string[]; screens: string[]; mixed: boolean };

const SIGNALS: { surface: Surface; label: string; path?: RegExp; text?: RegExp; weight: number }[] = [
	{ surface: 'product', label: 'dashboard, admin or settings routes', path: /(^|\/)(\(?dash(board)?\)?|admin|console|settings|account|billing|workspace|\((app|shell|main|authenticated|protected|private)\)|portal)(\/|$)/i, weight: 3 },
	{ surface: 'product', label: 'a sign-in screen', path: /(^|\/)(login|signin|sign-in|auth)(\/|\.|$)/i, weight: 2 },
	{ surface: 'product', label: 'data tables', text: /<(table|DataGrid|DataTable|Table)\b|\bTable\(|\bLazyColumn\b|\bUITableView\b|\bList\s*\{/, weight: 2 },
	{ surface: 'product', label: 'charts', text: /from ['"](recharts|chart\.js|react-chartjs-2|d3|@visx|apexcharts|echarts|@nivo|victory|lightweight-charts)|\b(LineChart|BarChart|AreaChart|Sparkline|TrendChart)\b/, weight: 3 },
	{ surface: 'product', label: 'an app shell (sidebar layout, tab view)', text: /\b(app-shell|AppShell|SidebarProvider|SidebarInset|dashboard-layout|TabView|NavigationView|NavigationSplitView|BottomNavigation|Scaffold)\b/, weight: 2 },
	{ surface: 'product', label: 'filters, periods and refresh controls', text: /\b(date-range|DateRange|pagination|paginate|Pagination)\b|<(select|input)[^>]*\b(filter|period)\b/i, weight: 1 },
	{ surface: 'product', label: 'metrics and status badges', text: /\b(metric|kpi|delta|status-badge|uptime|usage)\b/i, weight: 1 },
	{ surface: 'product', label: 'a native app (SwiftUI, Compose, Flutter, Android)', text: /\bimport SwiftUI\b|androidx\.compose|package:flutter\/|\bimport UIKit\b|<LinearLayout\b|<ConstraintLayout\b/, weight: 5 },
	{ surface: 'marketing', label: 'a hero section', text: /\b(hero)\b/i, weight: 3 },
	{ surface: 'marketing', label: 'pricing, testimonials or FAQ', text: /\b(pricing|testimonial|faq|logo-cloud|logos|case-stud(y|ies))\b/i, weight: 2 },
	{ surface: 'marketing', label: 'calls to action (get started, book a demo, sign up)', text: /(get started|book a demo|start free|sign up free|try it free|request a demo|join the waitlist)/i, weight: 2 },
	{ surface: 'marketing', label: 'blog, changelog or docs pages', path: /(^|\/)(blog|changelog|posts|articles|docs|legal|privacy|terms)(\/|$)/i, weight: 2 },
	{ surface: 'marketing', label: 'a site footer with link columns', text: /<footer\b/i, weight: 1 },
	{ surface: 'marketing', label: 'about, contact, careers or locations pages', path: /(^|\/)(about|contact|careers|locations|services|press|menu|wholesale|story)(\/|\.|$)/i, weight: 2 },
];

const SCREEN = /(^|\/)(app\/.*page\.[jt]sx?|pages\/[^_].*\.(tsx|jsx|astro|vue|svelte|md)|src\/routes\/.*\+page\.svelte|.*(Screen|View|Page|Activity|Fragment)\.(swift|kt|dart|tsx|jsx|vue)|.*\.html)$/;

const ROUTE = /(^|\/)(app|pages|routes|views|screens|templates)\/.*\.(tsx|jsx|ts|js|astro|vue|svelte|mdx?|html|erb|php|hbs|liquid|njk|twig|cshtml)$|^[^/]+\.html?$|(Screen|View|Page|Activity|Fragment)\.(swift|kt|dart)$/;

export function profileInterface(root: string, files: string[]): InterfaceProfile {
	const score = { product: 0, marketing: 0 };
	const routes = { product: 0, marketing: 0 };
	const hits = new Map<string, number>();
	const screens = files.filter((f) => SCREEN.test(f) && !/(^|\/)(node_modules|public)\//.test(f)).slice(0, 40);
	const sample = files.slice(0, 600);
	for (const signal of SIGNALS) {
		let n = 0;
		for (const rel of sample) {
			// Routes say what a project is; a notes folder or a library file named "changelog" does not.
			if (signal.path?.test(rel) && ROUTE.test(rel)) {
				n++;
				routes[signal.surface]++;
			}
			else if (signal.text && /\.(tsx|jsx|js|ts|astro|vue|svelte|html|swift|kt|dart|xml|erb|php|hbs|liquid|njk|twig|cshtml|razor|ejs)$/.test(rel)) {
				try {
					if (signal.text.test(readFileSync(join(root, rel), 'utf8'))) n++;
				} catch {}
			}
		}
		if (!n) continue;
		// Each kind of evidence counts, a few times at most, so one big folder cannot decide on its own.
		score[signal.surface] += signal.weight * Math.min(n, 3);
		hits.set(signal.label, n);
	}
	const name = (() => {
		try {
			return String(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name ?? '');
		} catch {
			return basename(root);
		}
	})();
	if (/(admin|dashboard|console|portal|app$|-app\b|backoffice|crm|studio)/i.test(name)) {
		score.product += 4;
		hits.set(`the project is named "${name}"`, 1);
	}
	if (/(site|website|landing|www|marketing|homepage)/i.test(name)) {
		score.marketing += 4;
		hits.set(`the project is named "${name}"`, 1);
	}
	const surface: Surface = score.product > score.marketing ? 'product' : 'marketing';
	const reasons = [...hits].filter(([label]) => SIGNALS.find((s) => s.label === label)?.surface !== (surface === 'product' ? 'marketing' : 'product')).map(([label, n]) => (n > 1 ? `${label} (${n} files)` : label));
	// Both kinds in one project (an app with its own marketing pages) only when each has its own routes: a site that
	// shows product demos talks about tables and charts without being a product.
	const mixed = routes.product > 0 && routes.marketing > 0 && Math.min(score.product, score.marketing) / Math.max(score.product, score.marketing) > 0.6;
	return { surface, product: score.product, marketing: score.marketing, reasons, screens, mixed };
}

/** The surface saved for the project, when init or apply recorded one. */
export function savedSurface(root: string): Surface | undefined {
	const path = join(root, '.ds', 'config.json');
	if (!existsSync(path)) return undefined;
	try {
		const s = JSON.parse(readFileSync(path, 'utf8')).surface;
		return s === 'product' || s === 'marketing' ? s : undefined;
	} catch {
		return undefined;
	}
}
