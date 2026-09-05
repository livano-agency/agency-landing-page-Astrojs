import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { readingTime } from '../src/lib/sanity/content-utils.ts';

// Run after build:local, or use test:published after building the imported Sanity content.
const sanityMode = process.env.SANITY_CONTENT_SOURCE === 'sanity';
const seed = JSON.parse(readFileSync(new URL('../content/seed.json', import.meta.url), 'utf8'));
const page = (path: string) => new JSDOM(readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8')).window.document;
const clean = (text: string) => text.replace(/\s+/gu, ' ').trim();

test('both original article URLs render all migrated text and correct metadata', () => {
  for (const post of seed.posts) {
    const document = page(`blog/${post.slug.current}/index.html`);
    assert.equal(document.querySelector('h1')?.textContent, post.title);
    assert.equal(document.querySelector('meta[name="description"]')?.getAttribute('content'), post.description);
    assert.equal(document.querySelector('time')?.getAttribute('datetime'), post.publishedAt);
    const expected = post.body.map(block => block.children.map(span => span.text).join('')).join(' ');
    const rendered = [...document.querySelectorAll('.article-body > *')].map(node => {
      if (['UL', 'OL'].includes(node.tagName)) return [...node.children].map(child => child.textContent).join(' ');
      return node.textContent;
    }).join(' ');
    assert.equal(clean(rendered), clean(expected));
    assert.ok(document.querySelector('.article-body strong'));
    assert.ok(document.querySelector('.article-body ul'));
    assert.ok(document.querySelector('a[href="/blog"]'));
    for (const link of document.querySelectorAll('a[href]')) {
      assert.ok(!link.getAttribute('href')?.startsWith('javascript:'));
    }
  }
  assert.ok(page('blog/how-to-sell-on-tiktok-shop/index.html').querySelector('.article-body a[href="/#calendly-section"]'));
  assert.ok(page('blog/tiktok-shop-canada/index.html').querySelector('.article-body ol'));
});

test('blog cards match their article titles, categories and reading times', () => {
  const document = page('blog/index.html');
  const headings = [...document.querySelectorAll('#blog h3')];
  if (!sanityMode) assert.deepEqual(headings.map(node => node.textContent), seed.posts.map(post => post.title));
  seed.posts.forEach((post) => {
    const heading = headings.find(node => node.closest('a')?.getAttribute('href') === `/blog/${post.slug.current}`);
    assert.equal(heading?.textContent, post.title);
    const card = heading?.closest('div.bg-box-bg');
    assert.ok(card?.textContent?.includes(post.category));
    assert.ok(card?.textContent?.includes(readingTime(post.body)));
    const image = card?.querySelector('img');
    if (sanityMode) {
      const url = new URL(image?.getAttribute('src') ?? '');
      assert.equal(url.origin, 'https://cdn.sanity.io');
      assert.ok(url.pathname.startsWith('/images/lwe89m68/production/'));
      assert.equal(url.searchParams.get('w'), '1000');
    } else {
      assert.equal(image?.getAttribute('src'), post.localCoverImage);
    }
    assert.ok(image?.getAttribute('alt'));
  });
});

test('homepage keeps the case study anchor and complete migrated use case', () => {
  const document = page('index.html');
  const section = document.querySelector('#case-study');
  assert.ok(section);
  const useCase = seed.useCases[0];
  for (const field of ['title', 'introduction', 'brandOrigin', 'industry', 'targetMarket', 'challenge', 'outcomeTitle', 'outcomeDescription', 'whyItWorked']) {
    assert.ok(clean(section.textContent ?? '').includes(useCase[field]), field);
  }
  assert.equal(section.querySelectorAll('li').length, 3);
  assert.ok(document.querySelector('a[href="/#case-study"]'));
});
