import { createReadStream, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getCliClient } from 'sanity/cli';

// Run through sanity exec --with-user-token; never put write tokens in the frontend.
const client = getCliClient({ apiVersion: '2026-09-05' }).withConfig({ useCdn: false, perspective: 'raw' });
const write = process.argv.includes('--write');
const seed = JSON.parse(readFileSync(new URL('../../content/seed.json', import.meta.url), 'utf8'));

if (client.config().projectId !== 'lwe89m68' || client.config().dataset !== 'production') {
  throw new Error('This migration is for lwe89m68 / production only.');
}

type SeedDocument = {
  _type: string;
  title: string;
  migrationSource: string;
  slug?: { current: string };
  localCoverImage?: string;
  coverImage?: { _type: string; alt: string; asset?: { _type: string; _ref: string } };
};

for (const source of [...seed.posts, ...seed.useCases] as SeedDocument[]) {
  // Check drafts too: rerunning must never overwrite an editor's changes.
  const existing = await client.fetch<string[]>(
    `*[_type == $type && (migrationSource == $source || ($slug != null && slug.current == $slug))]._id`,
    { type: source._type, source: source.migrationSource, slug: source.slug?.current ?? null },
  );
  if (existing.length) {
    console.log(`Skip existing: ${source.title}`);
    continue;
  }
  if (!write) {
    console.log(`Would import: ${source.title}`);
    continue;
  }
  const { localCoverImage, ...document } = source;
  if (localCoverImage) {
    if (!/^\/images\/[a-zA-Z0-9._-]+$/.test(localCoverImage)) throw new Error('Invalid seed image path.');
    const imagePath = new URL(`../../public${localCoverImage}`, import.meta.url);
    const asset = await client.assets.upload('image', createReadStream(fileURLToPath(imagePath)), {
      filename: localCoverImage.split('/').pop(),
    });
    document.coverImage = { ...document.coverImage!, asset: { _type: 'reference', _ref: asset._id } };
  }
  // These are existing publicly available articles, migrated as published content.
  // Sanity assigns the document ID. migrationSource supports safe sequential reruns.
  const created = await client.create(document);
  console.log(`Imported: ${source.title} (${created._id})`);
}
console.log(write ? 'Import complete. Run categories:migrate and content:validate, then build the website in Sanity mode.' : 'Dry run complete. Run content:import to upload images and create the missing documents.');
