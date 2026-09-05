import { defineField, defineType } from 'sanity';
import { ImageIcon } from '@sanity/icons/Image';

export const contentImage = defineType({
  name: 'contentImage', title: 'Image', type: 'image', icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alternative text', type: 'string', description: 'Describe the image for people using screen readers.', validation: (rule) => rule.required() }),
    defineField({ name: 'caption', type: 'string' }),
  ],
  validation: (rule) => rule.required().assetRequired(),
});
