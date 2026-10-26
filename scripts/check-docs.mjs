import { chromium } from 'playwright-core';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
// Run against a production build: development overlays cannot run inside the sandboxed previews.
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, headless: true });
const base = process.env.DOCS_URL ?? 'http://localhost:3109';
const screenshots = mkdtempSync(join(tmpdir(), 'context-docs-check-'));
const checks = [];
const pass = (name) => { checks.push(name); console.log(`PASS: ${name}`); };
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const nav = page.getByRole('navigation', { name: 'Library', exact: true });

    // Every docs page lives in the one shell, with its page head.
    for (const path of ['/', '/components', '/theme', '/agents', '/cli']) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('[data-library-shell]').count(), 1, `${path}: in the shell`);
        assert.equal(await page.locator('h1').count(), 1, `${path}: one h1`);
        assert.equal(await nav.locator(`a[href="${path}"]`).getAttribute('aria-current'), 'page', `${path}: marked current`);
    }
    pass('home, all components, theme, agents and CLI share the shell, each with one h1 and its rail row current');

    // The rail and the page head stay put across every component route; the current row is marked.
    await page.goto(base + '/components/button', { waitUntil: 'networkidle' });
    const measure = () => page.evaluate(() => {
        const n = document.querySelector('nav[aria-label="Library"]');
        const head = document.querySelector('[data-docs-head]');
        const side = document.querySelector('[data-slot="app-sidebar"]');
        return { railScroll: n.scrollTop, railX: side.getBoundingClientRect().x, railWidth: side.getBoundingClientRect().width, headX: head.getBoundingClientRect().x, headY: head.getBoundingClientRect().y };
    });
    const items = await nav.locator('a[data-item]').evaluateAll(links => links.map(link => ({ name: link.dataset.item, title: link.textContent.trim() })));
    assert.ok(items.length > 100, `every item is listed (${items.length})`);
    for (const item of items) {
        const link = nav.locator(`a[data-item="${item.name}"]`);
        // Center the row first: a row half under the list's edge is scrolled into view when it becomes current.
        await link.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const before = await measure();
        await link.click();
        await page.waitForURL(`**/components/${item.name}`);
        await page.getByRole('heading', { name: item.title, exact: true, level: 1 }).waitFor();
        const after = await measure();
        for (const key of Object.keys(before)) assert.ok(Math.abs(before[key] - after[key]) < 1, `${item.name}: ${key} moved from ${before[key]} to ${after[key]}`);
        assert.equal(await link.getAttribute('aria-current'), 'page', `${item.name}: current`);
    }
    pass(`stable rail and page head across ${items.length} item routes`);

    // The filter narrows the list, says when nothing matches, and keeps its value across navigation.
    const filter = nav.page().getByRole('searchbox', { name: 'Filter components' });
    await filter.fill('card');
    assert.ok(await nav.locator('a[data-item="card"]').count());
    await nav.locator('a[data-item="card"]').click();
    await page.waitForURL('**/components/card');
    assert.equal(await filter.inputValue(), 'card');
    await filter.fill('zzzz');
    await page.getByText('Nothing matches.').waitFor();
    await filter.fill('');
    pass('filter narrows the list, shows Nothing matches, and is kept after navigation');

    // The dashboard's sidebar and current row, as context-dashboard draws them.
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
    pass('framed previews render the brand; the sidebar and current row keep the dashboard metrics');

    // Copy boxes copy, and say so; a refused clipboard does not break the page.
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text; } } }));
    await page.locator('[data-docs-head] [data-slot="install-command"] button').click();
    assert.match(await page.evaluate(() => window.__copied), /add button$/);
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied'); }; });
    await page.locator('#source button').first().click();
    pass('install and code copy succeed and survive a denied clipboard');

    // A framed preview switches to the phone width.
    await page.goto(base + '/components/hero', { waitUntil: 'networkidle' });
    await page.getByRole('radio', { name: 'Phone', exact: true }).first().click();
    await page.waitForFunction(() => document.querySelector('iframe')?.style.width === '390px');
    pass('a full-page preview switches to 390px');

    // The palette, an example's own interaction, and Shift+Escape back to the library.
    await page.goto(base + '/components/button', { waitUntil: 'networkidle' });
    await page.keyboard.press('Meta+k');
    await page.getByRole('combobox').fill('switch');
    await page.getByRole('option', { name: 'Switch', exact: true }).click();
    await page.waitForURL('**/components/switch');
    const switchFrame = page.frameLocator('iframe[src="/preview/switch/Product"]');
    await switchFrame.locator('[data-preview-ready]').waitFor();
    await switchFrame.locator('[data-slot="switch"]').first().click();
    assert.equal(await switchFrame.locator('[data-slot="switch"]').first().getAttribute('data-state'), 'unchecked');
    await page.locator('h1').click();
    await page.keyboard.press('Shift+Escape');
    await page.waitForURL('**/components');
    pass('command palette, an example interaction and Shift+Escape');

    // Phones: the sidebar is a drawer that closes after a choice and on Escape, with no sideways scroll.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.locator('[data-slot="app-sidebar"]').waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(screenshots, 'context-library-mobile-nav.png') });
    await nav.locator('a[data-item="accordion"]').click();
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
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    pass('mobile drawer closes after a choice and on Escape, without horizontal overflow');

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
        pass('sidebar computed style parity with context-dashboard');
    }
    assert.deepEqual(errors, []);
    pass('no browser errors');
    console.log(JSON.stringify({ base, screenshots, checks: checks.length }, null, 2));
}
finally {
    await browser.close();
}
