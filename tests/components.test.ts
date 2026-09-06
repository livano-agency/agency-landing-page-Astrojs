import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'astro';
import { JSDOM } from 'jsdom';

const output = await mkdtemp(join(tmpdir(), 'launchlegit-components-'));
after(() => rm(output, { recursive: true, force: true }));
await build({
  root: fileURLToPath(new URL('../', import.meta.url)),
  configFile: false,
  srcDir: fileURLToPath(new URL('./fixtures/', import.meta.url)),
  outDir: output,
  publicDir: './tests/fixtures/public',
  logLevel: 'error',
});
const document = new JSDOM(await readFile(join(output, 'index.html'), 'utf8')).window.document;

test('body links apply nofollow independently of new-tab protection and preserve existing links', () => {
  const body = document.querySelector('#body-links');
  const links = [...body.querySelectorAll('a')];
  assert.equal(links.length, 5);
  const link = (name: string) => links.find(item => item.textContent === name)!;
  assert.equal(link('legacy').getAttribute('href'), '/blog');
  for (const name of ['legacy', 'follow']) {
    assert.equal(link(name).getAttribute('rel'), null);
    assert.equal(link(name).getAttribute('target'), null);
  }
  assert.equal(link('nofollow').getAttribute('rel'), 'nofollow');
  assert.equal(link('nofollow').getAttribute('target'), null);
  assert.equal(link('new-tab').getAttribute('rel'), 'noopener noreferrer');
  assert.equal(link('new-tab').getAttribute('target'), '_blank');
  assert.equal(link('nofollow-new-tab').getAttribute('rel'), 'noopener noreferrer nofollow');
  assert.equal(link('nofollow-new-tab').getAttribute('target'), '_blank');
  assert.ok(body.textContent?.includes('unsafe'));
  assert.equal(links.some(item => item.textContent === 'unsafe'), false);
});

test('all image display modes control both cropping and rendered image fit', () => {
  for (const mode of ['cover', 'contain-padded', 'contain', 'default']) {
    const frame = document.querySelector(`#${mode} .cms-image`);
    const image = frame?.querySelector('img');
    assert.ok(frame && image);
    const url = new URL(image.src);
    const cover = mode === 'cover' || mode === 'default';
    assert.equal(url.searchParams.get('h'), cover ? '630' : null);
    assert.equal(url.searchParams.get('fit'), cover ? 'crop' : 'max');
    assert.equal(image.style.objectFit, cover ? 'cover' : 'contain');
    assert.equal(frame.style.padding, mode === 'contain-padded' ? '1.5rem' : '0px');
    assert.equal(image.alt, 'Comparison chart');
  }
  const legacy = document.querySelector('#legacy-inline img');
  assert.ok(legacy);
  assert.equal(new URL(legacy.src).searchParams.get('h'), null);
  assert.equal(document.querySelector('#legacy-inline .cms-image'), null);
});

test('author cards show supplied details, omit empty authors and reject unsafe CTA URLs', () => {
  const author = document.querySelector('#author');
  assert.equal(author?.querySelector('h2')?.textContent, 'About Test Author');
  assert.ok(author?.textContent?.includes('Editor'));
  assert.ok(author?.textContent?.includes('Writes useful guides.'));
  assert.equal(author?.querySelector('a')?.getAttribute('href'), '/#calendly-section');
  assert.equal(author?.querySelector('a')?.textContent, 'Book a call');
  assert.equal(document.querySelector('#no-author aside'), null);
  assert.equal(document.querySelector('#unsafe-cta a'), null);
});
