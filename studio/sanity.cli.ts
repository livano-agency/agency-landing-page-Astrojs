import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  deployment: {
    appId: 'o7vophu8zg4z45n0ohtf0rto',
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'lwe89m68',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  typegen: {
    enabled: true,
    path: '../src/lib/sanity/queries.ts',
    schema: 'schema.json',
    generates: '../src/lib/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
});
