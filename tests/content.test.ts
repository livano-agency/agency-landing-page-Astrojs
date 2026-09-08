import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluate, parse } from 'groq-js';
import { BLOG_POSTS_QUERY, CASE_STUDIES_QUERY } from '../src/lib/sanity/queries.ts';
import { formatDate, readingTime, safeHref } from '../src/lib/sanity/content-utils.ts';

const seed = JSON.parse(readFileSync(new URL('../content/seed.json', import.meta.url), 'utf8'));

test('queries preserve blog URLs and order articles newest first', async () => {
  const dataset = [...seed.posts].reverse().map((post, index) => ({ ...post, _id: String(index) }));
  dataset.push({ _id: 'incomplete', _type: 'blogPost', title: 'No slug' });
  const result = await (await evaluate(parse(BLOG_POSTS_QUERY), { dataset })).get();
  assert.deepEqual(result.map(post => post.slug), ['tiktok-shop-canada', 'how-to-sell-on-tiktok-shop']);
  assert.ok(result.every(post => post.body.length && post.description));
});

test('case study query uses slugs, preserves legacy cases and orders published content', async () => {
  const base = { ...seed.useCases[0], slug: undefined };
  const dataset = [
    { ...base, _id: 'second', displayOrder: 2, slug: { current: 'new-case' } },
    { ...base, _id: 'formerly-hidden', displayOrder: 1, showOnHomepage: false },
    { ...base, _id: 'first', displayOrder: 0 },
  ];
  const result = await (await evaluate(parse(CASE_STUDIES_QUERY), { dataset })).get();
  assert.deepEqual(result.map(item => item._id), ['first', 'formerly-hidden', 'second']);
  assert.deepEqual(result.map(item => item.slug), ['first', 'formerly-hidden', 'new-case']);
  for (const query of [CASE_STUDIES_QUERY, BLOG_POSTS_QUERY]) {
    assert.deepEqual(await (await evaluate(parse(query), { dataset: [] })).get(), []);
  }
});

test('shared category references and blog authors resolve without exposing legacy labels', async () => {
  const category = { _id: 'category-1', _type: 'category', title: 'Renamed category' };
  const author = { _id: 'author-1', _type: 'author', name: 'Test Author', role: 'Editor', shortBio: 'A short biography', ctaButtonText: 'Book a call', ctaUrl: '/#calendly-section' };
  const post = { ...seed.posts[0], _id: 'post-1', categoryRef: { _type: 'reference', _ref: category._id }, author: { _type: 'reference', _ref: author._id } };
  const useCase = { ...seed.useCases[0], _id: 'case-1', categoryRef: post.categoryRef };
  const dataset = [category, author, post, useCase];
  const query = async (source, data = dataset) => (await evaluate(parse(source), { dataset: data })).get();
  const [result] = await query(BLOG_POSTS_QUERY);
  assert.equal(result.category, category.title);
  assert.equal(result.author.name, author.name);
  assert.equal(result.author.ctaUrl, author.ctaUrl);
  const [caseResult] = await query(CASE_STUDIES_QUERY);
  assert.equal(caseResult.category, category.title);
  assert.equal('author' in caseResult, false);
  const [missingReferences] = await query(BLOG_POSTS_QUERY, [post]);
  assert.equal(missingReferences.category, null);
  assert.equal(missingReferences.author, null);
  const [legacy] = await query(BLOG_POSTS_QUERY, [{ ...post, categoryRef: undefined, author: undefined }]);
  assert.equal(legacy.category, post.category);
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
