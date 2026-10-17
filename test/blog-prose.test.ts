import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BlogProse } from '../registry/components/site/blog-post';

describe('blog HTML', () => {
  it('removes executable markup while keeping article formatting', () => {
    const html = renderToStaticMarkup(createElement(BlogProse, {
      html: '<h2 id="example">Example</h2><script>alert(1)</script><img src="/logo.svg" alt="Logo" onerror="alert(2)"><a href="javascript:alert(3)">Unsafe</a><a href="https://example.com">Source</a><table><tbody><tr><td>Value</td></tr></tbody></table>',
    }));
    expect(html).not.toMatch(/<script|onerror|javascript:/);
    expect(html).toContain('<h2 id="example">Example</h2>');
    expect(html).toContain('src="/logo.svg" alt="Logo"');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('<td>Value</td>');
  });

  it('keeps JSX children working and cannot bypass sanitization through article props', () => {
    const children = renderToStaticMarkup(createElement(BlogProse, null, createElement('p', null, 'Article copy')));
    expect(children).toContain('<p>Article copy</p>');
    const html = renderToStaticMarkup(createElement(BlogProse, {
      html: '<p>Safe copy</p>',
      dangerouslySetInnerHTML: { __html: '<script>alert(1)</script>' },
    }));
    expect(html).toContain('<p>Safe copy</p>');
    expect(html).not.toContain('<script');
  });
});
