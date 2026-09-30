import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const VIEWPORTS = { desktop: { width: 1440, height: 900 }, tablet: { width: 834, height: 1112 }, mobile: { width: 390, height: 844 } } as const;
export type ViewportName = keyof typeof VIEWPORTS;
export type Shot = { viewport: ViewportName; index: number; path: string; top: number; height: number };

const SLICE = 1800;
const MAX_SLICES_PER_VIEWPORT = 8;

function cachedChromium(): string | undefined {
	const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(homedir(), 'Library', 'Caches', 'ms-playwright'), join(homedir(), '.cache', 'ms-playwright')].filter((r): r is string => !!r && existsSync(r));
	const candidates = [
		['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
		['chrome-mac', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
		['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
		['chrome-linux', 'chrome'],
		['chrome-linux64', 'chrome'],
		['chrome-headless-shell-mac-arm64', 'chrome-headless-shell'],
		['chrome-headless-shell-linux64', 'chrome-headless-shell'],
	];
	for (const root of roots) {
		for (const dir of readdirSync(root).filter((d) => /^chromium/.test(d)).sort().reverse()) {
			for (const parts of candidates) {
				const path = join(root, dir, ...parts);
				if (existsSync(path)) return path;
			}
		}
	}
	return undefined;
}

async function launch() {
	const { chromium } = await import('playwright-core').catch(() => {
		throw new Error('playwright-core is not installed. Run: npm i -D playwright-core && npx playwright install chromium');
	});
	const cached = cachedChromium();
	for (const opts of [{}, ...(cached ? [{ executablePath: cached }] : []), { channel: 'chrome' }, { channel: 'msedge' }]) {
		try {
			return await chromium.launch(opts);
		} catch {}
	}
	throw new Error('No Chromium found. Run: npx playwright install chromium');
}

export async function capture(url: string, viewports: ViewportName[], outDir: string): Promise<Shot[]> {
	mkdirSync(outDir, { recursive: true });
	const browser = await launch();
	const shots: Shot[] = [];
	try {
		for (const viewport of viewports) {
			const page = await browser.newPage({ viewport: VIEWPORTS[viewport], deviceScaleFactor: 1, extraHTTPHeaders: { Accept: 'text/html' } });
			await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
			await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}' });
			const height = await page.evaluate(() => document.documentElement.scrollHeight);
			for (let y = 0; y < height; y += 600) {
				await page.evaluate((top) => window.scrollTo(0, top), y);
				await page.waitForTimeout(60);
			}
			await page.evaluate(() => window.scrollTo(0, 0));
			await page.waitForTimeout(400);
			const slices = Math.min(MAX_SLICES_PER_VIEWPORT, Math.ceil(height / SLICE));
			for (let i = 0; i < slices; i++) {
				const top = i * SLICE;
				const path = join(outDir, `${viewport}-${String(i).padStart(2, '0')}.png`);
				await page.screenshot({ path, fullPage: true, clip: { x: 0, y: top, width: VIEWPORTS[viewport].width, height: Math.min(SLICE, height - top) } });
				shots.push({ viewport, index: i, path, top, height: Math.min(SLICE, height - top) });
			}
			await page.close();
		}
	} finally {
		await browser.close();
	}
	return shots;
}
