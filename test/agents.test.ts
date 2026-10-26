import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { patchUtils } from '../src/library/swap.js';
import { sessionStart } from '../src/hooks/handlers.js';

const root = join(import.meta.dirname, '..');
const bin = join(root, 'bin.js');
const created: string[] = [];
const fixture = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-agent-')); created.push(dir);
  for (const [path, text] of Object.entries(files)) { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); }
  return dir;
};
const run = (cwd: string, ...args: string[]) => execFileSync(process.execPath, [bin, ...args, '--no-install'], { cwd, encoding: 'utf8' });
const json = (cwd: string, ...args: string[]) => JSON.parse(run(cwd, ...args, '--json'));
afterEach(() => { for (const path of created.splice(0)) rmSync(path, { recursive: true, force: true }); });

describe('agent discovery', () => {
  it('reads full APIs and helper files without changing a project, with global JSON flags', () => {
    const cwd = fixture({ 'package.json': '{}' });
    expect(json(cwd, 'guide').guide).toContain('without converting');
    const before = readdirSync(cwd);
    const items = JSON.parse(run(cwd, '--json', 'list', 'form', '--surface', 'product'));
    expect(items.some((i: any) => i.name === 'field')).toBe(true);
    expect(items.every((i: any) => ['product', 'both'].includes(i.surface))).toBe(true);
    const field = json(cwd, 'inspect', 'field');
    expect(field.api[0].content).toContain('error?: React.ReactNode');
    expect(field.files[0].content).toContain('aria-invalid');
    expect(field.install).toContain('add field --surface product');
    expect(field.reference.sources[0].repository).toBe('context-dashboard');
    const example = json(cwd, 'inspect', 'user-menu');
    expect(example.exampleFiles.some((file: any) => file.path.endsWith('demo-feedback.tsx'))).toBe(true);
    expect(json(cwd, 'list', '--type', 'lib').some((i: any) => i.name === 'surface')).toBe(true);
    expect(readdirSync(cwd)).toEqual(before);
  });
  it('returns parseable errors and rejects invalid setup before writing', () => {
    const cwd = fixture({ 'package.json': '{}' });
    for (const args of [['init', '--surface', 'invalid'], ['inspect', '..'], ['inspect'], ['unknown-command'], ['list', '--type', 'invalid']]) {
      const result = spawnSync(process.execPath, [bin, ...args, '--json', '--no-install'], { cwd, encoding: 'utf8' });
      expect(result.status).toBe(1);
      expect(JSON.parse(result.stdout).error.message.length).toBeGreaterThan(0);
      expect(readdirSync(cwd)).toEqual(['package.json']);
    }
  });
});

describe('initializing without restyling', () => {
  const cases = [
    ['site', 'site', { 'index.html': '<html><head><link rel="stylesheet" href="styles.css"></head><body><h1>Keep my content</h1></body></html>', 'styles.css': 'h1 {color: red}' }],
    ['product', 'product', { 'package.json': '{"dependencies":{"react":"19.2.8"}}', 'src/index.css': '.original { padding: 13px; }', 'src/App.tsx': 'export const App = () => <button>Keep my action</button>;' }],
    ['plain HTML', 'site', { 'index.html': '<html><head></head><body><h1>Keep my content</h1></body></html>' }],
    ['dark site', 'site', { 'index.html': '<html class="dark"><head></head><body>Keep dark content</body></html>', 'styles.css': ':root {--original: #010101}' }],
    ['Tailwind', 'product', { 'package.json': '{"dependencies":{"react":"19.2.8","tailwindcss":"4.3.3"}}', 'src/index.css': '@import "tailwindcss";\n.original{color:red}' }],
    ['native', 'product', { 'Package.swift': '// sample native project', 'View.swift': 'let title = "Keep my content"' }],
  ] as const;
  it.each(cases)('initializes %s, preserves content, and is idempotent', (_name, surface, sample) => {
    const files = { ...sample, 'AGENTS.md': 'Existing project instructions.\n' };
    const cwd = fixture(files);
    const before = readdirSync(cwd);
    const dry = json(cwd, 'init', '--surface', surface, '--dry-run');
    expect(dry.dryRun).toBe(true); expect(readdirSync(cwd)).toEqual(before);
    const first = json(cwd, 'init', '--surface', surface);
    expect(first.mode).toBe('build'); expect(first.changes.length).toBeGreaterThan(0);
    expect(existsSync(join(cwd, '.ds/state.json'))).toBe(false);
    expect(readFileSync(join(cwd, 'AGENTS.md'), 'utf8')).toContain('Existing project instructions.');
    for (const [path, text] of Object.entries(sample)) {
      const after = readFileSync(join(cwd, path), 'utf8');
      if (path.endsWith('.html')) expect(after).toContain(text.match(/<body>(.*?)<\/body>/)![0]);
      else if (path.endsWith('.css')) expect(after.replace(/^@import url[^\n]*\n/gm, '').replace(/^@import "\.\/_context-ds\/[^\n]+\n/gm, '')).toBe(text);
      else expect(after).toContain(text);
    }
    expect(json(cwd, 'init', '--surface', surface).changes).toEqual([]);
    expect(sessionStart(cwd).stdout).toContain('new pages');
  });
});

it('add previews dependencies, reports kept files, and inherits the initialized surface', () => {
  const dependencies = JSON.parse(readFileSync(join(root, 'apps/www/package.json'), 'utf8'));
  const cwd = fixture({ 'package.json': JSON.stringify({ dependencies: { ...dependencies.dependencies, ...dependencies.devDependencies } }), 'tsconfig.json': '{"compilerOptions":{"paths":{"@/*":["./src/*"]}}}', 'src/index.css': '@import "tailwindcss";\n', 'src/components/ui/button.tsx': '// Existing button, preserve it.\n' });
  json(cwd, 'init', '--surface', 'product');
  const dry = json(cwd, 'add', 'button', 'field', 'input', '--dry-run');
  expect(dry.kept).toContain('src/components/ui/button.tsx');
  expect(existsSync(join(cwd, 'src/components/ui/field.tsx'))).toBe(false);
  const result = json(cwd, 'add', 'button', 'field', 'input');
  expect(result.packagesInstalled).toBe(true);
  expect(result.written).toContain('src/components/ui/field.tsx');
  expect(readFileSync(join(cwd, 'src/components/ui/button.tsx'), 'utf8')).toContain('Existing button');
  expect(readFileSync(join(cwd, 'src/_context-ds/brand.css'), 'utf8')).toContain('font-size: 93.75%');
});

it('explains why add cannot run outside a supported React and Tailwind app', () => {
  const cwd = fixture({ 'package.json': '{}', 'index.html': '<html><head></head><body></body></html>' });
  const result = spawnSync(process.execPath, [bin, 'add', 'scroll-area', '--json', '--no-install'], { cwd, encoding: 'utf8' });
  expect(result.status).toBe(1);
  const message = JSON.parse(result.stdout).error.message;
  expect(message).toContain('React not detected');
  expect(message).toContain('Tailwind CSS not detected');
  expect(message).toContain('target React 19.2+ and Tailwind 4 app');
  expect(readdirSync(cwd).sort()).toEqual(['index.html', 'package.json']);
});

it('publishes complete, consistent text documentation for every registry item', () => {
  const index = JSON.parse(readFileSync(join(root, 'apps/www/public/r/index.json'), 'utf8'));
  for (const item of index.items.filter((i: any) => i.type !== 'theme')) {
    const data = JSON.parse(readFileSync(join(root, `apps/www/public/r/${item.name}.json`), 'utf8'));
    const markdown = readFileSync(join(root, `apps/www/public/components/${item.name}.md`), 'utf8');
    expect(data.api.length, item.name).toBeGreaterThan(0);
    expect(markdown, item.name).toContain(data.api[0].content);
    expect(data.usage, item.name).toBeTruthy();
    expect(data.reference.scope, item.name).toBeTruthy();
    if (item.surface === 'site' || item.surface === 'product') expect(data.install).toContain(`--surface ${item.surface}`);
  }
});

it('upgrades existing merge helpers for new typography tokens without removing application exports', () => {
  const before = 'import { extendTailwindMerge } from "tailwind-merge";\nconst twMerge = extendTailwindMerge({extend: {classGroups: {"font-size": [{text: ["body-sm", "custom-type"]}]}}});\nexport const appValue = 42;';
  const after = patchUtils(before)!;
  expect(after).toContain('"hero-desktop"');
  expect(after).toContain('"custom-type"');
  expect(after).toContain('export const appValue = 42');
  expect(patchUtils(after)).toBeUndefined();
});
