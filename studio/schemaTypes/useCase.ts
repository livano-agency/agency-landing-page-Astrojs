import { defineArrayMember, defineField, defineType } from 'sanity';
import { DocumentIcon } from '@sanity/icons/Document';

export const useCase = defineType({
  name: 'useCase', title: 'Case study', type: 'document', icon: DocumentIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug', type: 'slug',
      description: 'The /case-studies/ URL. Generate before publishing and keep it unchanged afterward. Existing cases without a slug use their document ID.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required().custom((value) => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Use lowercase letters, numbers, and single hyphens.'),
    }),
    defineField({ name: 'introduction', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: 'brandOrigin', title: 'Brand origin', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'industry', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'categoryRef', title: 'Category', type: 'reference', to: [{ type: 'category' }], description: 'Categories are shared with blog posts.' }),
    defineField({ name: 'targetMarket', title: 'Target market', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'challenge', type: 'text', rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: 'deliverables', title: 'What we delivered', type: 'array', of: [defineArrayMember({ type: 'string', validation: (rule) => rule.required() })], validation: (rule) => rule.required().min(1) }),
    defineField({ name: 'outcomeTitle', title: 'Outcome headline', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'outcomeDescription', title: 'Outcome description', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: 'whyItWorked', title: 'Why it worked', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: 'showOnHomepage', title: 'Legacy homepage visibility', type: 'boolean', readOnly: true, hidden: true, deprecated: { reason: 'Published cases now appear on the Case Studies page. Unpublish a case to remove it from the website.' } }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0, validation: (rule) => rule.required().integer().min(0), description: 'Lower numbers appear first.' }),
    defineField({ name: 'migrationSource', type: 'string', hidden: true, readOnly: true }),
  ],
  orderings: [{ title: 'Case study order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'brandOrigin' } },
});
