import { chromium } from 'playwright-core';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
// Run against a production build: development overlays cannot run inside the sandboxed previews.
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, headless: true });
const base = process.env.DOCS_URL ?? 'http://127.0.0.1:3109';
const screenshots = mkdtempSync(join(tmpdir(), 'context-docs-check-'));
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/components/button', { waitUntil: 'networkidle' });
    await page.locator('iframe').first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('iframe')?.getAttribute('style')?.includes('height: 900px') === false);
    const f = page.frames().find(f => f.url().includes('/preview/button/Site'));
    assert.equal(await f.locator('[data-slot="button"]').first().evaluate(el => getComputedStyle(el).borderRadius), '9999px');
    const getStyle = el => { const s = getComputedStyle(el); return Object.fromEntries(['width', 'height', 'paddingLeft', 'paddingRight', 'borderRadius', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor'].map(k => [k, s[k]])); };
    const sidebar = await page.locator('[data-slot="app-sidebar"]').evaluate(getStyle);
    const active = await page.locator('nav[aria-label="Library"] [aria-current="page"]').evaluate(getStyle);
    assert.equal(sidebar.width, '212px');
    assert.equal(active.height, '30px');
    assert.equal(active.fontSize, '12.6px');
    assert.equal(active.backgroundColor, 'rgba(0, 0, 0, 0.07)');
    await page.screenshot({ path: join(screenshots, 'context-library-desktop.png') });
    await page.keyboard.press('Meta+k');
    await page.getByRole('combobox').fill('switch');
    await page.getByRole('option', { name: 'Switch', exact: true }).click();
    await page.waitForURL('**/components/switch');
    await page.locator('[data-slot="switch"]').first().click();
    assert.equal(await page.locator('[data-slot="switch"]').first().getAttribute('data-state'), 'unchecked');
    await page.locator('h1').click();
    await page.keyboard.press('Shift+Escape');
    await page.waitForURL('**/components');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.locator('[data-slot="app-sidebar"]').waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(screenshots, 'context-library-mobile-nav.png') });
    await page.getByRole('link', { name: 'Components', exact: true }).click();
    await page.waitForURL('**/components/accordion');
    await page.waitForTimeout(300);
    assert.equal(await page.locator('[data-slot="app-sidebar"]').isVisible(), false);
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.locator('[data-slot="app-sidebar"]').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert.equal(await page.locator('[data-slot="app-sidebar"]').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(screenshots, 'context-library-mobile.png') });
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    assert.equal(await page.getByText('Components, blocks and visuals for React and Tailwind.', { exact: false }).count(), 0);
    await page.screenshot({ path: join(screenshots, 'context-home-mobile.png') });
    if (process.env.DASHBOARD_REFERENCE_URL) {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(process.env.DASHBOARD_REFERENCE_URL, { waitUntil: 'networkidle' });
        await page.getByRole('link', { name: 'Overview', exact: true }).waitFor();
        await page.waitForTimeout(1800);
        const sourceSidebar = await page.locator('aside').first().evaluate(getStyle);
        const sourceActive = await page.locator('nav [aria-current="page"]').evaluate(getStyle);
        for (const k of ['width', 'paddingLeft', 'paddingRight', 'backgroundColor'])
            assert.equal(sidebar[k], sourceSidebar[k], `sidebar ${k}`);
        for (const k of ['height', 'paddingLeft', 'paddingRight', 'borderRadius', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor'])
            assert.equal(active[k], sourceActive[k] === "oklab(0 0 0 / 0.07)" ? "rgba(0, 0, 0, 0.07)" : sourceActive[k], `active ${k}`);
    }
    console.log(JSON.stringify({ base, screenshots, sidebar, active, errors, checks: ['preview hydration/styles', ...(process.env.DASHBOARD_REFERENCE_URL ? ['sidebar computed style parity'] : []), 'search keyboard and route', 'switch interaction', 'Back keyboard shortcut', 'mobile drawer navigation and Escape', 'no mobile overflow', 'home subheader removed'] }, null, 2));
    assert.deepEqual(errors, []);
}
finally {
    await browser.close();
}
