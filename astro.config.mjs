import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import { loadEnv } from "vite";

const env = { ...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), ""), ...process.env };

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL || undefined,
  integrations: [tailwind()]
});
