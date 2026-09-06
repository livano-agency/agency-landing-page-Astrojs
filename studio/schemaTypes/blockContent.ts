import { defineArrayMember, defineField, defineType } from 'sanity';
import { LinkIcon } from '@sanity/icons/Link';

export const blockContent = defineType({
  name: 'blockContent', title: 'Article body', type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Subheading', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [{ title: 'Bulleted list', value: 'bullet' }, { title: 'Numbered list', value: 'number' }],
      marks: {
        decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
        annotations: [
          defineArrayMember({
            name: 'link', title: 'Link', type: 'object', icon: LinkIcon,
            fields: [
              defineField({ name: 'href', title: 'URL', type: 'url', validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) }),
              defineField({ name: 'openInNewTab', title: 'Open in a new tab', type: 'boolean', initialValue: false }),
              defineField({ name: 'nofollow', title: 'Nofollow', type: 'boolean', initialValue: false, description: 'Turn on to mark this link as nofollow for search engines. Leave off for a normal (dofollow) link.' }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: 'contentImage' }),
  ],
});
