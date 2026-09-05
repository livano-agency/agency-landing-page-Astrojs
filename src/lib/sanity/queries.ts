import { defineQuery } from 'groq';

// The published perspective also excludes drafts and release versions.
export const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc, _id asc) {
    _id, title, "slug": slug.current, description, publishedAt, category,
    coverImage, body, seoTitle, seoDescription
  }
`);

export const HOME_USE_CASES_QUERY = defineQuery(`
  *[_type == "useCase" && showOnHomepage == true] | order(displayOrder asc, _id asc) {
    _id, title, introduction, brandOrigin, industry, targetMarket, challenge,
    deliverables, outcomeTitle, outcomeDescription, whyItWorked
  }
`);
