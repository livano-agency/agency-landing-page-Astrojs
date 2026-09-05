import { createClient } from '@sanity/client';
import { BLOG_POSTS_QUERY, HOME_USE_CASES_QUERY } from './queries';
import type { BLOG_POSTS_QUERY_RESULT, HOME_USE_CASES_QUERY_RESULT } from './sanity.types';

export type BlogPost = BLOG_POSTS_QUERY_RESULT[number];
export type UseCase = HOME_USE_CASES_QUERY_RESULT[number];
// Local image paths are only used in the explicit pre-migration local mode.
export type RenderablePost = Omit<BlogPost, 'coverImage'> & {
  coverImage: BlogPost['coverImage'] | null;
  localCoverImage?: string;
  localCoverAlt?: string;
};

const source = import.meta.env.SANITY_CONTENT_SOURCE || 'sanity';
if (!['local', 'sanity'].includes(source)) {
  throw new Error('SANITY_CONTENT_SOURCE must be "sanity" or "local".');
}

const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'lwe89m68',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-09-05',
  perspective: 'published',
  useCdn: false,
  token: import.meta.env.SANITY_API_READ_TOKEN || undefined,
});

export async function getBlogPosts(): Promise<RenderablePost[]> {
  if (source === 'local') {
    const { default: seed } = await import('../../../content/seed.json');
    // Seed data is validated by the migration script and content tests.
    return seed.posts.map((post) => ({
      ...post,
      _id: post.migrationSource,
      slug: post.slug.current,
      coverImage: null,
      localCoverAlt: post.coverImage.alt,
      author: null,
      body: post.body as BlogPost['body'],
    }));
  }
  // Errors intentionally fail the build; an empty published result stays empty.
  const posts = await client.fetch(BLOG_POSTS_QUERY);
  const slugs = new Set<string>();
  for (const post of posts) {
    if (!post.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)) {
      throw new Error(`Invalid or duplicate blog slug: ${post.slug}`);
    }
    slugs.add(post.slug);
  }
  return posts;
}

export async function getHomeUseCases(): Promise<UseCase[]> {
  if (source === 'local') {
    const { default: seed } = await import('../../../content/seed.json');
    return seed.useCases.filter((item) => item.showOnHomepage)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({ ...item, _id: item.migrationSource, category: item.industry }));
  }
  return client.fetch(HOME_USE_CASES_QUERY);
}
