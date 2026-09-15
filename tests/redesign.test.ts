import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { JSDOM } from 'jsdom';

const dist = resolve('dist');
const paths = readdirSync(dist, { recursive: true }).filter(path => String(path).endsWith('.html') && statSync(join(dist, String(path))).isFile()) as string[];
const pages = paths.map(path => ({ path, document: new JSDOM(readFileSync(join(dist, path), 'utf8')).window.document }));

test('all supplied page types build with navigation, metadata, and one main landmark', () => {
  for (const path of ['index.html', 'services/index.html', 'about/index.html', 'features/index.html', 'contact/index.html', 'privacy-policy/index.html', 'blog/index.html', 'case-studies/index.html']) {
    const document = pages.find(page => page.path === path)?.document;
    assert.ok(document, path);
    assert.equal(document.querySelectorAll('main').length, 1, path);
    assert.equal(document.querySelectorAll('h1').length, 1, path);
    assert.ok(document.querySelector('nav[aria-label="Primary navigation"] a[href="/contact"]'), path);
    assert.ok(document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.startsWith('https://launchlegit.com/'), path);
    assert.ok(document.querySelector('meta[name="description"]')?.getAttribute('content'), path);
  }
});

test('internal links, fragments and local media resolve across the built site', () => {
  for (const { path, document } of pages) {
    if (document.querySelector('meta[http-equiv="refresh"]')) continue;
    for (const node of document.querySelectorAll('a[href], img[src]')) {
      const value = node.getAttribute('href') || node.getAttribute('src')!;
      assert.notEqual(value, '#', `${path}: placeholder link`);
      if (!value.startsWith('/') && !value.startsWith('#')) continue;
      const [pathname, fragment] = value.split('#');
      let target = pathname ? join(dist, pathname) : join(dist, path);
      if (pathname && !/\.[a-z0-9]+$/i.test(pathname)) target = join(target, 'index.html');
      assert.ok(existsSync(target), `${path}: missing ${value}`);
      if (fragment && target.endsWith('.html')) {
        const targetDocument = new JSDOM(readFileSync(target, 'utf8')).window.document;
        assert.ok(targetDocument.getElementById(decodeURIComponent(fragment)), `${path}: missing fragment ${value}`);
      }
    }
  }
});

test('booking uses the existing call path and no forms are rendered', () => {
  for (const path of ['index.html', 'services/index.html', 'about/index.html', 'contact/index.html']) {
    const document = pages.find(page => page.path === path)!.document;
    assert.equal(document.querySelectorAll('form').length, 0, path);
    assert.equal(document.querySelectorAll('[id="booking"]').length, 0, path);
  }
  const home = pages.find(page => page.path === 'index.html')!.document;
  assert.ok(home.querySelector('#calendly-section'));
  assert.ok(home.querySelector('a[href="https://calendly.com/lokman-launchlegit/30min"]'));
  const privacy = pages.find(page => page.path === 'privacy-policy/index.html')!.document;
  assert.equal(privacy.querySelector('meta[name="robots"]')?.getAttribute('content'), 'noindex,follow');
});
