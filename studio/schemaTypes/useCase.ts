import { defineArrayMember, defineField, defineType } from 'sanity';
import { DocumentIcon } from '@sanity/icons/Document';

export const useCase = defineType({
  name: 'useCase', title: 'Case study', type: 'document', icon: DocumentIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
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
    defineField({ name: 'showOnHomepage', title: 'Show on homepage', type: 'boolean', initialValue: true, description: 'Publish the document as well to display it on the homepage.' }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0, validation: (rule) => rule.required().integer().min(0), description: 'Lower numbers appear first.' }),
    defineField({ name: 'migrationSource', type: 'string', hidden: true, readOnly: true }),
  ],
  orderings: [{ title: 'Homepage order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'brandOrigin' } },
});
