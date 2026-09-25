import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mnp-navi.jp",
  output: "static",
  trailingSlash: "always",
  srcDir: process.env.RM_SINGLE_SRC || undefined,
  outDir: process.env.RM_SINGLE_OUT || undefined,
  build: {
    format: "directory",
  },
});
