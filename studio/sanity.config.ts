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
      S.listItem().id('blog').title('Blog').child(S.list().title('Blog').items([
        S.documentTypeListItem('blogPost').title('Blog Posts'),
        S.documentTypeListItem('category').title('Categories'),
        S.documentTypeListItem('author').title('Authors'),
      ])),
      S.listItem().id('caseStudies').title('Case Studies').child(S.list().title('Case Studies').items([
        S.documentTypeListItem('useCase').title('Case Studies'),
        S.documentTypeListItem('category').title('Categories'),
      ])),
    ]),
  })],
  schema: { types: schemaTypes },
});
