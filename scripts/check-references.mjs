// Compare shared visual contracts with the current public site. Does not certify dashboard-only or retained variants.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const base = process.env.DOCS_URL ?? 'http://127.0.0.1:3109';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, headless: true });
const checks = [];
const props = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'];
const read = async locator => locator.evaluate((el, names) => Object.fromEntries(names.map(key => [key, getComputedStyle(el)[key]])), props);
const compare = (name, viewport, actual, expected) => {
  for (const [property, value] of Object.entries(expected)) {
    checks.push({ name, viewport, property, reference: value, library: actual[property], matches: actual[property] === value });
  }
};
try {
  for (const width of [1440, 390]) {
    const live = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const local = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await Promise.all([live.goto('https://www.context.dev/', { waitUntil: 'domcontentloaded' }), local.goto(base + '/preview/hero/Site', { waitUntil: 'networkidle' })]);
    await Promise.all([live.evaluate(() => document.fonts.ready), local.evaluate(() => document.fonts.ready)]);
    compare('site root', width, await read(local.locator('html')), await read(live.locator('html')));
    compare('hero heading', width, await read(local.locator('h1')), await read(live.locator('h1')));
    await local.goto(base + '/preview/button/Site', { waitUntil: 'networkidle' });
    const buttonProps = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'borderColor', 'borderWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
    const buttonStyle = locator => locator.evaluate((el, names) => Object.fromEntries(names.map(key => [key, getComputedStyle(el)[key]])), buttonProps);
    compare('site primary pill', width, await buttonStyle(local.getByRole('link', { name: 'Start for free' })), await buttonStyle(live.locator('a[href="/signup"].bg-black').first()));
    if (width === 1440) {
      compare('site outline pill', width, await buttonStyle(local.getByRole('link', { name: 'Read the docs' })), await buttonStyle(live.getByRole('link', { name: 'Explore Search', exact: true })));
    }
    await Promise.all([live.close(), local.close()]);
  }
  const failed = checks.filter(check => !check.matches);
  const output = { checkedAt: new Date().toISOString(), reference: 'https://www.context.dev/', method: 'Computed styles in Chromium at 1440px and 390px with reduced motion and loaded fonts. Font-size, weight, line height, tracking, colors, borders, and padding; font family names differ under Next font hashing.', checks, failed: failed.length };
  writeFileSync(process.env.REFERENCE_CHECK_OUTPUT ?? '/private/tmp/context-reference-measurements.json', JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ checks: checks.length, failures: failed }, null, 2));
  assert.equal(failed.length, 0, 'Shared site styles differ from the live reference');
} finally { await browser.close(); }
