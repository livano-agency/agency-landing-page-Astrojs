import { defineQuery } from 'groq';

// The published perspective also excludes drafts and release versions.
export const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc, _id asc) {
    _id, title, "slug": slug.current, description, publishedAt,
    "category": select(defined(categoryRef) => categoryRef->title, category),
    author->{_id, name, slug, role, profileImage, shortBio, ctaButtonText, ctaUrl},
    coverImage, body, seoTitle, seoDescription
  }
`);

export const CASE_STUDIES_QUERY = defineQuery(`
  *[_type == "useCase" && defined(slug.current)] | order(publishedAt desc, _id asc) {
    _id, title, "slug": slug.current, description, publishedAt,
    "category": select(defined(categoryRef) => categoryRef->title, category),
    author->{_id, name, slug, role, profileImage, shortBio, ctaButtonText, ctaUrl},
    coverImage, body, seoTitle, seoDescription
  }
`);
