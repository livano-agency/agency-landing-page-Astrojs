import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons/User';

export const author = defineType({
  name: 'author', title: 'Author', type: 'document', icon: UserIcon,
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: 'Role / Title', type: 'string', description: 'E.g., CEO & Co-Founder, Livano Agency' }),
    defineField({ name: 'profileImage', title: 'Profile image', type: 'image', options: { hotspot: true }, fields: [
      defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required() }),
    ] }),
    defineField({ name: 'shortBio', title: 'Short bio', type: 'text', rows: 4, description: 'Used in the author card beneath blog posts.' }),
    defineField({ name: 'ctaButtonText', title: 'CTA button text', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'CTA URL', type: 'url', validation: (rule) => rule.uri({ allowRelative: true, scheme: ['http', 'https'] }) }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'profileImage' } },
});
