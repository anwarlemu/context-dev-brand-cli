import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.DOCS_URL ?? 'http://127.0.0.1:3109';
const out = process.env.LIBRARY_CHECK_OUTPUT ?? '/private/tmp/context-library-review';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, headless: true });
const results = [], errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(8000);
page.setDefaultNavigationTimeout(30000);
page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
const check = async (name, run) => {
  if (process.env.LIBRARY_CHECK && !new RegExp(process.env.LIBRARY_CHECK).test(name)) return;
  try { await run(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log(`FAIL ${name}: ${error.message.slice(0, 250)}`); await page.screenshot({ path: `${out}/failure-${results.length}.png` }); }
};
const open = async (name, example = 'Product') => {
  await page.goto(`${base}/components/${name}`, { waitUntil: 'networkidle' });
  const iframe = page.locator(`iframe[src="/preview/${name}/${example}"]`);
  await iframe.scrollIntoViewIfNeeded();
  const frame = page.frameLocator(`iframe[src="/preview/${name}/${example}"]`);
  await frame.locator('[data-preview-ready]').waitFor();
  return frame;
};
// Playwright's iframe coordinates omit CSS scale. Scroll natively, wait for layout, then use rendered bounds for real pointer clicks.
const click = async locator => {
  await locator.evaluate(el => {
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))));
  });
  const handle = await locator.elementHandle();
  const frame = await handle.ownerFrame();
  if (frame === page.mainFrame()) { await locator.click(); return; }
  const host = await frame.frameElement();
  const outer = await host.boundingBox();
  const inner = await locator.evaluate(el => ({ rect: el.getBoundingClientRect().toJSON(), width: innerWidth }));
  const scale = outer.width / inner.width;
  await page.mouse.click(outer.x + (inner.rect.x + inner.rect.width / 2) * scale, outer.y + (inner.rect.y + inner.rect.height / 2) * scale);
};
const fits = async locator => {
  await locator.waitFor();
  await page.waitForTimeout(250);
  assert.ok(await locator.evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; }), 'Overlay fits within its own viewport');
};
try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await check(`live email and JSON validation ${width}`, async () => {
      let frame = await open('field');
      const email = frame.getByRole('textbox', { name: 'Email', exact: true });
      for (const [value, valid] of [['ada@acme.com', true], ['ada@', false], ['', false], ['a+b@context.dev', true]]) {
        await email.fill(value);
        assert.equal(await email.getAttribute('aria-invalid'), valid ? null : 'true');
        assert.equal(await frame.getByText('Enter a valid email.', { exact: true }).count(), valid ? 0 : 1);
      }
      assert.match(await email.getAttribute('aria-describedby'), /message/);
      frame = await open('input');
      await frame.getByRole('textbox', { name: 'Email', exact: true }).fill('ada@acme.com');
      assert.equal(await frame.getByRole('textbox', { name: 'Email', exact: true }).getAttribute('aria-invalid'), 'false');
      frame = await open('textarea');
      await frame.getByRole('textbox', { name: 'Schema' }).fill('{"plans":[]}');
      assert.equal(await frame.getByRole('textbox', { name: 'Schema' }).getAttribute('aria-invalid'), 'false');
      await frame.getByText('Valid JSON.', { exact: true }).waitFor();
    });
    await check(`sheet stays non-modal and closes ${width}`, async () => {
      const frame = await open('sheet');
      assert.equal(await frame.getByRole('dialog').count(), 0);
      await click(frame.getByRole('button', { name: 'acme.com/pricing', exact: true }));
      await fits(frame.getByRole('dialog'));
      assert.equal(await frame.locator('body').evaluate(el => getComputedStyle(el).pointerEvents), 'auto');
      assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).pointerEvents), 'auto');
      await click(frame.getByRole('button', { name: 'Pause monitor', exact: true }));
      await frame.getByText('paused', { exact: true }).waitFor();
      if (width === 1440) {
        await click(frame.getByRole('button', { name: 'acme.com/docs', exact: true }));
        await frame.getByRole('heading', { name: 'acme.com/docs' }).waitFor();
        await frame.getByText('active', { exact: true }).waitFor();
      }
      await click(frame.getByRole('button', { name: 'Close', exact: true }));
      await frame.getByRole('dialog').waitFor({ state: 'hidden' });
      await click(frame.getByRole('button', { name: 'acme.com/pricing', exact: true }));
      await frame.locator('body').press('Escape');
      await frame.getByRole('dialog').waitFor({ state: 'hidden' });
    });
    await check(`dialog create, focus, and isolated library navigation ${width}`, async () => {
      const frame = await open('dialog');
      const trigger = frame.getByRole('button', { name: 'Create key', exact: true });
      await click(trigger);
      await fits(frame.getByRole('dialog'));
      assert.equal(await frame.getByRole('button', { name: 'Create', exact: true }).isDisabled(), true);
      await frame.getByRole('textbox', { name: /Name/ }).fill('Browser test');
      await click(frame.getByRole('button', { name: 'Create', exact: true }));
      await frame.getByRole('status').filter({ hasText: 'Browser test key created' }).waitFor();
      await click(trigger);
      await frame.locator('body').press('Escape');
      await frame.getByRole('dialog').waitFor({ state: 'hidden' });
      await page.waitForTimeout(250);
      assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
      await click(trigger);
      await click(page.getByRole('link', { name: 'Design system', exact: true }));
      await page.waitForURL(base + '/');
    });
    await check(`popover saves and select changes ${width}`, async () => {
      let frame = await open('popover');
      await click(frame.getByRole('button', { name: 'Rename', exact: true }));
      await fits(frame.getByRole('dialog'));
      await frame.getByRole('textbox', { name: /Workspace name/ }).fill('Research');
      await click(frame.getByRole('button', { name: 'Save', exact: true }));
      await frame.getByRole('status').filter({ hasText: 'Workspace: Research' }).waitFor();
      frame = await open('select');
      await click(frame.getByRole('combobox', { name: 'Range' }));
      await fits(frame.getByRole('listbox'));
      await click(frame.getByRole('option', { name: 'Last 7 days', exact: true }));
      assert.equal(await frame.getByRole('combobox', { name: 'Range' }).textContent(), 'Last 7 days');
    });
    await check(`menu rename, duplicate, and hold-delete ${width}`, async () => {
      const frame = await open('dropdown-menu');
      const trigger = frame.getByRole('button', { name: 'Actions for Production key', exact: true });
      await click(trigger); await fits(frame.getByRole('menu'));
      await click(frame.getByRole('menuitem', { name: 'Rename', exact: true }));
      await frame.getByRole('textbox', { name: /Name/ }).fill('Staging');
      await click(frame.getByRole('button', { name: 'Save', exact: true }));
      await click(frame.getByRole('button', { name: 'Actions for Staging', exact: true }));
      await click(frame.getByRole('menuitem', { name: 'Duplicate', exact: true }));
      await click(frame.getByRole('button', { name: 'Actions for Staging copy', exact: true }));
      const remove = frame.getByRole('menuitem', { name: /^Delete/ });
      await remove.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(1700); await page.keyboard.up('Space');
      await frame.getByRole('status').filter({ hasText: 'Staging copy deleted.' }).waitFor();
      assert.equal(await frame.getByRole('button', { name: 'Actions for Staging copy', exact: true }).count(), 0);
    });
    await check(`checkbox group, tags, radios and switches ${width}`, async () => {
      let frame = await open('checkbox');
      const all = frame.getByRole('checkbox', { name: 'All APIs', exact: true });
      assert.equal(await all.getAttribute('aria-checked'), 'mixed');
      await click(all); assert.equal(await all.getAttribute('aria-checked'), 'true');
      await click(all); assert.equal(await all.getAttribute('aria-checked'), 'false');
      await click(frame.getByRole('checkbox', { name: 'Search', exact: true }));
      assert.equal(await all.getAttribute('aria-checked'), 'mixed');
      frame = await open('tags-input');
      const tags = frame.getByRole('textbox', { name: 'Domains', exact: true });
      await click(frame.getByRole('button', { name: 'Remove not a domain', exact: true }));
      assert.equal(await tags.getAttribute('aria-invalid'), null);
      await tags.fill('context.dev'); await tags.press('Enter');
      await frame.getByRole('button', { name: 'Remove context.dev', exact: true }).waitFor();
      await tags.fill('composing'); await tags.dispatchEvent('keydown', { key: 'Enter', keyCode: 229, isComposing: true });
      assert.equal(await tags.inputValue(), 'composing');
      frame = await open('segmented-control');
      const group = frame.getByRole('radiogroup', { name: 'Range', exact: true });
      await group.getByRole('radio', { name: '7 days', exact: true }).focus(); await page.keyboard.press('ArrowRight');
      assert.equal(await group.getByRole('radio', { name: '30 days', exact: true }).getAttribute('aria-checked'), 'true');
      await page.keyboard.press('Home'); assert.equal(await group.getByRole('radio', { name: '24h', exact: true }).getAttribute('aria-checked'), 'true');
      frame = await open('switch');
      const toggle = frame.getByRole('switch').first(); const original = await toggle.getAttribute('aria-checked');
      await toggle.press('Space'); assert.notEqual(await toggle.getAttribute('aria-checked'), original);
    });
    await check(`workspace creation and settings ${width}`, async () => {
      const frame = await open('workspace-switcher');
      await click(frame.getByRole('button', { name: /switch organization/ }));
      await click(frame.getByRole('menuitem', { name: /Personal.*Free/ }));
      await click(frame.getByRole('button', { name: 'Personal, switch organization' }));
      await click(frame.getByRole('menuitem', { name: 'Create organization', exact: true }));
      await frame.getByRole('textbox', { name: /Name/ }).fill('Research');
      await click(frame.getByRole('button', { name: 'Save', exact: true }));
      await click(frame.getByRole('button', { name: 'Research, switch organization' }));
      await click(frame.getByRole('button', { name: 'Organization settings', exact: true }));
      await frame.getByRole('textbox', { name: /Name/ }).fill('Research team');
      await click(frame.getByRole('button', { name: 'Save', exact: true }));
      await frame.getByRole('button', { name: 'Research team, switch organization' }).waitFor();
    });
    await check(`theme and logout inside preview ${width}`, async () => {
      const frame = await open('user-menu');
      await click(frame.getByRole('button', { name: 'Account menu', exact: true }));
      await fits(frame.getByRole('menu'));
      await click(frame.getByRole('radio', { name: 'Dark', exact: true }));
      assert.equal(await frame.locator('html').getAttribute('data-theme'), 'dark');
      assert.notEqual(await page.locator('html').getAttribute('data-theme'), 'dark');
      await click(frame.getByRole('radio', { name: 'Light', exact: true }));
      await click(frame.getByRole('menuitem', { name: 'Log out', exact: true }));
      await frame.getByRole('status').filter({ hasText: 'Signed out of this example.' }).waitFor();
      await click(frame.getByRole('button', { name: 'Sign in again', exact: true }));
      await frame.getByRole('button', { name: 'Account menu', exact: true }).waitFor();
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await check('clipboard writes from sandbox', async () => {
    const frame = await open('copy-button');
    await click(frame.locator('[data-slot="copy-button"]').first());
    await frame.getByRole('button', { name: 'Copied', exact: true }).waitFor();
  });
  await check('hold cancels on release and window blur', async () => {
    const frame = await open('hold-button');
    const hold = frame.getByRole('button', { name: 'Delete workspace', exact: true });
    await hold.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(150); await page.keyboard.up('Space'); await page.waitForTimeout(1300);
    assert.equal(await frame.getByRole('status').count(), 0);
    await page.keyboard.down('Space'); await frame.locator('body').evaluate(() => window.dispatchEvent(new Event('blur'))); await page.waitForTimeout(1300); await page.keyboard.up('Space');
    assert.equal(await frame.getByRole('status').count(), 0);
    await hold.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(1700); await page.keyboard.up('Space');
    await frame.getByRole('status').filter({ hasText: 'Example workspace deleted.' }).waitFor();
  });
  await check('table creates, edits, disables and deletes keys', async () => {
    const frame = await open('table-page', 'Paid');
    await click(frame.getByRole('button', { name: 'Create API key', exact: true }));
    await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Browser key');
    await click(frame.getByRole('button', { name: 'Create key', exact: true }));
    await click(frame.getByRole('button', { name: 'Actions for Browser key', exact: true }));
    await click(frame.getByRole('menuitem', { name: 'Edit name and permissions', exact: true }));
    await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Renamed key');
    await frame.getByRole('combobox', { name: 'Permissions', exact: true }).selectOption('Read only');
    await click(frame.getByRole('button', { name: 'Save', exact: true }));
    await click(frame.getByRole('button', { name: 'Actions for Renamed key', exact: true }));
    let item = frame.getByRole('menuitem', { name: /^Disable key/ });
    await item.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(1700); await page.keyboard.up('Space');
    await frame.getByRole('row').filter({ hasText: 'Renamed key' }).getByText('Disabled', { exact: true }).waitFor();
    await click(frame.getByRole('button', { name: 'Actions for Renamed key', exact: true }));
    item = frame.getByRole('menuitem', { name: /^Delete key/ });
    await item.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(1700); await page.keyboard.up('Space');
    await frame.getByRole('button', { name: 'Actions for Renamed key', exact: true }).waitFor({ state: 'hidden' });
  });
  await check('billing updates plan and example card', async () => {
    const frame = await open('settings-page', 'Billing');
    await click(frame.getByRole('button', { name: 'Change plan', exact: true }));
    await click(frame.getByRole('button', { name: 'Starter', exact: true }));
    await frame.getByText('Starter plan', { exact: true }).waitFor();
    await click(frame.getByRole('button', { name: 'Update card', exact: true }));
    await frame.getByRole('textbox', { name: "Example card's last four digits" }).fill('1234');
    await click(frame.getByRole('button', { name: 'Save', exact: true }));
    await frame.getByText('Visa ···· 1234', { exact: true }).waitFor();
  });
  await check('tabs, accordion and collapsible controls change content', async () => {
    let frame = await open('tabs');
    await click(frame.getByRole('tab', { name: 'Paused', exact: true }));
    await frame.getByRole('tabpanel').filter({ hasText: 'Monitors you stopped.' }).waitFor();
    frame = await open('accordion', 'Site');
    await click(frame.getByRole('button', { name: 'Is there a free plan?', exact: true }));
    await frame.getByText('Yes: 1,000 credits a month, no card required.', { exact: true }).waitFor();
    frame = await open('collapse');
    await click(frame.getByRole('button', { name: 'Hide advanced settings', exact: true }));
    const collapsed = frame.locator('[data-slot="collapse"][data-state="closed"]');
    await collapsed.waitFor({ state: 'attached' });
    assert.equal(await collapsed.evaluate(el => el.inert), true);
    await page.waitForTimeout(350);
    assert.ok(await collapsed.evaluate(el => el.getBoundingClientRect().height) < 1);
    await click(frame.getByRole('button', { name: 'Show advanced settings', exact: true }));
    await frame.getByRole('textbox', { name: 'Timeout', exact: true }).fill('60');
  });
  await check('playground runs, switches result view and resets', async () => {
    const frame = await open('playground-result-card', 'Ready');
    await frame.getByRole('heading', { name: 'Ready to scrape', exact: true }).waitFor();
    await click(frame.getByRole('button', { name: /Scrape.*1 credit/ }));
    await frame.getByRole('status').filter({ hasText: 'Scraping acme.com' }).waitFor();
    await frame.getByText('200 OK', { exact: true }).waitFor();
    await click(frame.getByRole('radio', { name: 'JSON', exact: true }));
    await frame.getByText('"success"', { exact: true }).waitFor();
    await click(frame.getByRole('button', { name: 'Back to ready', exact: true }));
    await frame.getByRole('heading', { name: 'Ready to scrape', exact: true }).waitFor();
  });
  await check('parameters reset and preview shortcuts reach library search', async () => {
    const frame = await open('playground-parameters');
    const toggle = frame.getByRole('switch', { name: 'Main content only', exact: true });
    await click(toggle);
    assert.equal(await toggle.getAttribute('aria-checked'), 'false');
    await click(frame.getByRole('button', { name: 'Reset', exact: true }));
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await toggle.focus(); await page.keyboard.press('Meta+k');
    await page.getByRole('dialog').waitFor();
    await page.getByRole('combobox').fill('Sheet');
    await page.getByRole('option', { name: 'Sheet', exact: true }).waitFor();
    await page.keyboard.press('Escape');
  });
  await check('credits, chart filters, pricing and tooltip respond', async () => {
    let frame = await open('credits-menu');
    await click(frame.getByRole('button', { name: '41,590 credits remaining', exact: true }));
    await fits(frame.getByRole('dialog'));
    const topUp = frame.getByRole('switch', { name: 'Auto top-up', exact: true });
    await click(topUp); assert.equal(await topUp.getAttribute('aria-checked'), 'false');
    await click(frame.getByRole('button', { name: 'Upgrade plan', exact: true }));
    await click(frame.getByRole('button', { name: 'Choose Scale', exact: true }));
    await click(frame.getByRole('button', { name: '41,590 credits remaining', exact: true }));
    await frame.getByText('Scale', { exact: true }).waitFor();
    frame = await open('usage-card');
    await click(frame.getByRole('radio', { name: 'Last 7 days', exact: true }));
    await frame.getByRole('img', { name: 'API calls by status, last 7 days', exact: true }).waitFor();
    await click(frame.getByRole('button', { name: 'Break usage down by: Status', exact: true }));
    await click(frame.getByRole('option', { name: /Auth/ }));
    await frame.getByRole('img', { name: 'API calls by auth, last 7 days', exact: true }).waitFor();
    frame = await open('pricing', 'Site');
    await click(frame.getByRole('button', { name: /^Yearly/ }));
    await frame.getByText(/\$990\/yr/).waitFor();
    frame = await open('tooltip');
    await click(frame.getByRole('button', { name: 'About credits', exact: true }));
    await frame.getByRole('tooltip').filter({ hasText: 'Credits reset' }).waitFor();
  });
  await check('sidebar icons removed and scroll affordance follows overflow', async () => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.goto(base + '/components/accordion', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Library', exact: true });
    assert.equal(await nav.locator('[data-slot="sidebar-link"] svg').count(), 0);
    await page.getByRole('button', { name: 'Scroll navigation down', exact: true }).waitFor();
    const before = await nav.evaluate(el => el.scrollTop);
    await click(page.getByRole('button', { name: 'Scroll navigation down', exact: true }));
    await page.waitForTimeout(600);
    assert.ok(await nav.evaluate(el => el.scrollTop) > before);
    await nav.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await page.getByRole('button', { name: 'Scroll navigation down', exact: true }).waitFor({ state: 'hidden' });
    assert.equal(await nav.getAttribute('data-scroll-above'), 'true');
    await page.screenshot({ path: `${out}/sidebar.png` });
  });
  if (process.env.LIBRARY_CRAWL !== '0') {
    const items = JSON.parse(readFileSync(new URL('../apps/www/lib/registry-index.json', import.meta.url), 'utf8')).items;
    const jobs = items.flatMap(item => item.examples.flatMap(example => [1440, 390].map(width => ({ name: item.name, example, width }))));
    const scans = [];
    await Promise.all(Array.from({ length: 4 }, async () => {
      const tab = await browser.newPage();
      let job;
      while ((job = jobs.shift())) {
        const record = { ...job, errors: [] };
        const onError = error => record.errors.push(error.message);
        tab.on('pageerror', onError);
        try {
          await tab.setViewportSize({ width: job.width, height: 1000 });
          const response = await tab.goto(`${base}/preview/${job.name}/${job.example}`, { waitUntil: 'domcontentloaded' });
          assert.equal(response.status(), 200);
          await tab.locator('[data-preview-ready]').waitFor({ timeout: 15000 });
          await tab.waitForTimeout(150);
          record.overflow = await tab.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          record.passed = record.errors.length === 0 && !record.overflow;
        } catch (error) { record.passed = false; record.errors.push(error.message); }
        tab.off('pageerror', onError); scans.push(record);
      }
      await tab.close();
    }));
    writeFileSync(`${out}/render-audit.json`, JSON.stringify(scans, null, 2));
    results.push({ name: 'all example routes render at desktop and phone widths', passed: scans.every(scan => scan.passed), layouts: scans.length, failures: scans.filter(scan => !scan.passed) });
    console.log(JSON.stringify(results.at(-1)));
  }
} finally {
  writeFileSync(`${out}/interactions.json`, JSON.stringify({ base, results, errors }, null, 2));
  await browser.close();
}
assert.deepEqual(errors, []);
assert.equal(results.filter(result => !result.passed).length, 0, 'Every component interaction and render check must pass');
