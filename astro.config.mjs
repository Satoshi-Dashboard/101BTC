import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4321,
  },
});
