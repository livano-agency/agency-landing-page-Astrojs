import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2026-09-05' }).withConfig({ useCdn: false, perspective: 'raw' });
if (client.config().projectId !== 'lwe89m68' || client.config().dataset !== 'production') {
  throw new Error('This migration is for lwe89m68 / production only.');
}
const write = process.argv.includes('--write');
type Category = { _id: string; title: string; slug?: { _type?: 'slug'; current: string } };
type Content = { _id: string; _rev: string; _type: string; title: string; category?: string; industry?: string; categoryRef?: { _ref: string } };
const categories = await client.fetch<Category[]>('*[_type == "category"]{_id, title, slug}');
const documents = await client.fetch<Content[]>('*[_type in ["blogPost", "useCase"]]{_id, _rev, _type, title, category, industry, categoryRef}');
const normalize = (value: string) => value.trim().toLocaleLowerCase('en-US');
const slugify = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
const planned = new Map<string, string>();

async function resolveCategory(title: string): Promise<string> {
  const key = normalize(title);
  if (planned.has(key)) return planned.get(key)!;
  const matches = categories.filter((category) => normalize(category.title) === key);
  const published = matches.find((category) => !category._id.startsWith('drafts.') && !category._id.startsWith('versions.'));
  if (published) return published._id;
  if (matches.length) throw new Error(`Publish the existing category "${title}" before migrating references.`);
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (categories.some((category) => category.slug?.current === slug)) slug = `${base}-${suffix++}`;
  if (!write) {
    console.log(`Would create category: ${title}`);
    planned.set(key, `planned/${slug}`);
    return `planned/${slug}`;
  }
  const category = await client.create({ _type: 'category', title: title.trim(), slug: { _type: 'slug' as const, current: slug } });
  categories.push(category);
  planned.set(key, category._id);
  console.log(`Created category: ${title}`);
  return category._id;
}

// Handle drafts independently; never publish a draft or replace the old label.
for (const document of documents) {
  if (document.categoryRef?._ref) continue;
  const title = document._type === 'blogPost' ? document.category : document.industry;
  if (typeof title !== 'string' || !title.trim()) continue;
  const reference = await resolveCategory(title);
  if (write) {
    await client.patch(document._id).ifRevisionId(document._rev)
      .setIfMissing({ categoryRef: { _type: 'reference', _ref: reference } }).commit();
  }
  console.log(`${write ? 'Linked' : 'Would link'} ${document.title} → ${title}`);
}
console.log(write ? 'Category migration complete. Existing labels and document publication states were preserved.' : 'Dry run complete. Pass --write to create categories and add references.');
