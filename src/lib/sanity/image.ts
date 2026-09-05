import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { imagePresentation } from './image-presentation';

const builder = createImageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'lwe89m68',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
});

export function imageUrl(source: SanityImageSource, width = 1000, height?: number, displayStyle?: string | null): string {
  let image = builder.image(source).width(width).auto('format').fit('max');
  // Contain must receive the uncropped rendition, not a server-cropped image.
  if (height && imagePresentation(displayStyle).fit === 'cover') image = image.height(height).fit('crop');
  return image.url();
}
