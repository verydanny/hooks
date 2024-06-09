import { defineConfig } from "astro/config";
import honoAstro from "hono-astro-adapter";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: honoAstro(),
  vite: {
    css: {
      transformer: "lightningcss",
    },
  },
  build: {
    inlineStylesheets: 'never'
  }
});
