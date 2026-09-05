import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'launchlegit',
  title: 'LaunchLegit',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'lwe89m68',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({
    structure: (S) => S.list().title('Content').items([
      S.documentTypeListItem('blogPost').title('Blog Posts'),
      S.documentTypeListItem('useCase').title('Use Cases'),
    ]),
  })],
  schema: { types: schemaTypes },
});
