import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';

export const blogPost = defineType({
  name: 'blogPost', title: 'Blog post', type: 'document', icon: DocumentTextIcon,
  groups: [{ name: 'content', title: 'Content', default: true }, { name: 'seo', title: 'Search & sharing' }],
  fields: [
    defineField({ name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug', type: 'slug', group: 'content',
      description: 'The /blog/ URL. Keep this unchanged after publishing to preserve existing links.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required().custom((value) => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Use lowercase letters, numbers, and single hyphens.'),
    }),
    defineField({ name: 'description', title: 'Summary', type: 'text', rows: 3, group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'publishedAt', title: 'Publication date', type: 'datetime', group: 'content', initialValue: () => new Date().toISOString(), description: 'Displayed date and sort order. Use Publish to make the article public; this field does not schedule publication.', validation: (rule) => rule.required() }),
    defineField({ name: 'category', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'coverImage', title: 'Cover image', type: 'contentImage', group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'body', type: 'blockContent', group: 'content', validation: (rule) => rule.required().min(1) }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', description: 'Optional. Defaults to the article title.', validation: (rule) => rule.max(70).warning('Shorter titles work better in search results.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo', description: 'Optional. Defaults to the summary.', validation: (rule) => rule.max(160).warning('Aim for 160 characters or fewer.') }),
    defineField({ name: 'migrationSource', type: 'string', hidden: true, readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'coverImage' } },
});
