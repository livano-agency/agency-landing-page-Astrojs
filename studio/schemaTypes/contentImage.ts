import { defineField, defineType } from 'sanity';
import { ImageIcon } from '@sanity/icons/Image';

export const contentImage = defineType({
  name: 'contentImage', title: 'Image', type: 'image', icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alternative text', type: 'string', description: 'Describe the image for people using screen readers.', validation: (rule) => rule.required() }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({
      name: 'displayStyle', title: 'Display style', type: 'string', initialValue: 'cover',
      options: { layout: 'radio', list: [
        { title: 'Cover (default)', value: 'cover' },
        { title: 'Contain with padding', value: 'contain-padded' },
        { title: 'Contain', value: 'contain' },
      ] },
      description: 'Cover fills the frame. Contain keeps the full image visible; padding adds space around it.',
    }),
  ],
  validation: (rule) => rule.required().assetRequired(),
});
