import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

const builder = createImageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'lwe89m68',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
});

export function imageUrl(source: SanityImageSource, width = 1000, height?: number): string {
  let image = builder.image(source).width(width).auto('format').fit('max');
  if (height) image = image.height(height).fit('crop');
  return image.url();
}
