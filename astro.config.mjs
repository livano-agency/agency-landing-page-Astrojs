import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import { loadEnv } from "vite";

const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 12)) {
  throw new Error(
    `This project requires Node.js 22.12+; currently running ${process.version} (${process.execPath}). ` +
    'Stop the server, run "nvm use" in the same terminal, then restart with "npm run dev".'
  );
}

const env = { ...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), ""), ...process.env };

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL || undefined,
  // Include page styles in the HTML to avoid render-blocking CSS requests.
  build: { inlineStylesheets: 'always' },
  integrations: [tailwind()]
});
