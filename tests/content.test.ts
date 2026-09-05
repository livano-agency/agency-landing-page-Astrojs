import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluate, parse } from 'groq-js';
import { BLOG_POSTS_QUERY, HOME_USE_CASES_QUERY } from '../src/lib/sanity/queries.ts';
import { formatDate, readingTime, safeHref } from '../src/lib/sanity/content-utils.ts';

const seed = JSON.parse(readFileSync(new URL('../content/seed.json', import.meta.url), 'utf8'));

test('queries preserve blog URLs and order articles newest first', async () => {
  const dataset = [...seed.posts].reverse().map((post, index) => ({ ...post, _id: String(index) }));
  dataset.push({ _id: 'incomplete', _type: 'blogPost', title: 'No slug' });
  const result = await (await evaluate(parse(BLOG_POSTS_QUERY), { dataset })).get();
  assert.deepEqual(result.map(post => post.slug), ['tiktok-shop-canada', 'how-to-sell-on-tiktok-shop']);
  assert.ok(result.every(post => post.body.length && post.description));
});

test('use case query honors visibility, manual order and empty content', async () => {
  const base = seed.useCases[0];
  const dataset = [
    { ...base, _id: 'second', displayOrder: 2 },
    { ...base, _id: 'hidden', showOnHomepage: false },
    { ...base, _id: 'first', displayOrder: 0 },
  ];
  const result = await (await evaluate(parse(HOME_USE_CASES_QUERY), { dataset })).get();
  assert.deepEqual(result.map(item => item._id), ['first', 'second']);
  for (const query of [HOME_USE_CASES_QUERY, BLOG_POSTS_QUERY]) {
    assert.deepEqual(await (await evaluate(parse(query), { dataset: [] })).get(), []);
  }
});

test('rich-text links permit useful URLs and reject executable or disguised URLs', () => {
  for (const href of ['/#calendly-section', '#faq', '/blog', 'https://example.com/path', 'mailto:hello@example.com', 'tel:+123456789']) {
    assert.equal(safeHref(href), href);
  }
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '/\\example.com', 'java\nscript:alert(1)', ' https://example.com', '', null]) {
    assert.equal(safeHref(href), undefined);
  }
});

test('dates are stable across timezones and reading time ignores image blocks', () => {
  assert.equal(formatDate('2025-05-02T00:00:00Z'), 'May 2, 2025');
  assert.equal(readingTime([]), '1 min');
  assert.equal(readingTime([
    { _type: 'block', children: [{ text: 'word '.repeat(201) }] },
    { _type: 'contentImage' },
  ]), '2 min');
});

test('seed Portable Text contains valid keys, supported styles and resolved link marks', () => {
  for (const post of seed.posts) {
    assert.equal(new Set(post.body.map(block => block._key)).size, post.body.length);
    for (const block of post.body) {
      assert.equal(block._type, 'block');
      assert.ok(['normal', 'h2', 'h3', 'blockquote'].includes(block.style));
      assert.ok(block.children.some(span => span.text.trim()));
      const definitions = new Set(block.markDefs.map(mark => mark._key));
      for (const span of block.children) {
        assert.ok(span._key);
        assert.ok(span.marks.every(mark => ['strong', 'em'].includes(mark) || definitions.has(mark)));
      }
      for (const mark of block.markDefs) assert.ok(safeHref(mark.href));
    }
  }
});
