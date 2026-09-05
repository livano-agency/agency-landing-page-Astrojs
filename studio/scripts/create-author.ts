import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2026-09-05' }).withConfig({ useCdn: false, perspective: 'raw' });
if (client.config().projectId !== 'lwe89m68' || client.config().dataset !== 'production') {
  throw new Error('This setup is for lwe89m68 / production only.');
}
// Supplied author details; no existing blog post is attributed automatically.
const existing = await client.fetch<string[]>('*[_type == "author" && (slug.current == "rabii-babou-ceo" || name == "Rabii Babou")]._id');
if (existing.length) {
  console.log('Rabii Babou already exists. Existing profiles and drafts were left untouched.');
} else if (!process.argv.includes('--write')) {
  console.log('Would create Rabii Babou with the supplied bio and booking CTA, using his existing website portrait. Blog assignments remain unchanged.');
} else {
  const asset = await client.assets.upload('image', createReadStream(fileURLToPath(new URL('../../public/images/founder_rabii.jpg', import.meta.url))), { filename: 'founder_rabii.jpg' });
  await client.create({
    _type: 'author', name: 'Rabii Babou', slug: { _type: 'slug', current: 'rabii-babou-ceo' },
    role: 'CEO & Co-Founder, Livano Agency',
    profileImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: 'Rabii Babou' },
    shortBio: 'Rabii Babou is the CEO of Livano Agency, where he helps brands scale through influencer partnerships, affiliate systems, and TikTok’s social-commerce engine.',
    ctaButtonText: 'Book a call with Rabii', ctaUrl: 'https://livanoagency.com/#calendly-section',
  });
  console.log('Created Rabii Babou. Select him in a blog post’s Author field to show the byline and author card.');
}
